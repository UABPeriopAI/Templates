"""Background worker for running blocking operations off the main thread."""

from __future__ import annotations

import traceback
from typing import Any, Callable

from PySide6.QtCore import QObject, QRunnable, Signal, Slot


class WorkerSignals(QObject):
    """Signals emitted by PipelineWorker. Thread-safe across Qt event loop."""

    result = Signal(object)
    error = Signal(str)
    progress = Signal(int, int, str)


class PipelineWorker(QRunnable):
    """Run a callable in QThreadPool and emit result/error signals."""

    def __init__(self, fn: Callable[..., Any], *args: Any, **kwargs: Any) -> None:
        super().__init__()
        self.fn = fn
        self.args = args
        self.kwargs = kwargs
        self.signals = WorkerSignals()
        self.setAutoDelete(True)

    @Slot()
    def run(self) -> None:
        try:
            result = self.fn(*self.args, **self.kwargs)
            self.signals.result.emit(result)
        except Exception as e:
            tb = traceback.format_exc()
            self.signals.error.emit(f"{e}\n\n{tb}")
