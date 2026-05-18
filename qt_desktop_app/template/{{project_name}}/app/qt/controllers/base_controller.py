"""Base controller with async dispatch and persistence helpers."""

from __future__ import annotations

from typing import Any, Callable, Optional
import logging

from PySide6.QtCore import QObject, QThreadPool, Signal

from app.qt.workers.pipeline_worker import PipelineWorker

logger = logging.getLogger(__name__)


class BaseController(QObject):
    """Base class for all controllers. Provides async execution and error handling."""

    error_occurred = Signal(str)
    status_updated = Signal(str)
    busy_changed = Signal(bool, str)

    def __init__(
        self,
        config: Any = None,
        data_store: Any = None,
        parent: QObject | None = None,
    ) -> None:
        super().__init__(parent)
        self._config = config
        self._data_store = data_store
        self._thread_pool = QThreadPool.globalInstance()
        self._active_signals: list[QObject] = []

    def _run_async(
        self,
        fn: Callable[..., Any],
        *args: Any,
        on_success: Callable[[Any], None],
        on_error: Optional[Callable[[str], None]] = None,
        on_progress: Optional[Callable[[int, int, str], None]] = None,
        message: str = "Working...",
        **kwargs: Any,
    ) -> None:
        """Dispatch a blocking function to the thread pool."""
        self.busy_changed.emit(True, message)
        self.status_updated.emit(message)

        worker = PipelineWorker(fn, *args, **kwargs)
        signals = worker.signals
        self._active_signals.append(signals)

        if on_progress:
            signals.progress.connect(on_progress)

        signals.result.connect(
            lambda r: self._handle_success(r, on_success, signals)
        )
        signals.error.connect(
            lambda e: self._handle_error(
                e, on_error or self._default_error_handler, signals
            )
        )
        self._thread_pool.start(worker)

    def _handle_success(
        self,
        result: Any,
        callback: Callable[[Any], None],
        signals: QObject,
    ) -> None:
        if signals in self._active_signals:
            self._active_signals.remove(signals)
        self.busy_changed.emit(False, "")
        callback(result)

    def _handle_error(
        self,
        error_msg: str,
        callback: Callable[[str], None],
        signals: QObject,
    ) -> None:
        if signals in self._active_signals:
            self._active_signals.remove(signals)
        self.busy_changed.emit(False, "")
        callback(error_msg)

    def _default_error_handler(self, error_msg: str) -> None:
        first_line = error_msg.split("\n", 1)[0]
        self.status_updated.emit(f"Error: {first_line}")
        self.error_occurred.emit(error_msg)
        logger.error("Controller error: %s", error_msg)
