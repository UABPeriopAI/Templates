"""Semi-transparent progress overlay for long-running operations."""

from __future__ import annotations

from PySide6.QtCore import Qt
from PySide6.QtWidgets import QLabel, QProgressBar, QVBoxLayout, QWidget


class ProgressOverlay(QWidget):
    """Overlay that covers its parent to show progress."""

    def __init__(self, parent: QWidget | None = None) -> None:
        super().__init__(parent)
        self.setAutoFillBackground(True)
        pal = self.palette()
        pal.setColor(self.backgroundRole(), Qt.GlobalColor.white)
        self.setPalette(pal)
        self.setWindowOpacity(0.85)

        self._label = QLabel("Working...")
        self._label.setAlignment(Qt.AlignmentFlag.AlignCenter)

        self._progress = QProgressBar()
        self._progress.setRange(0, 0)

        layout = QVBoxLayout(self)
        layout.addStretch()
        layout.addWidget(self._label)
        layout.addWidget(self._progress)
        layout.addStretch()

        self.hide()

    def show_progress(self, message: str = "Working...") -> None:
        self._label.setText(message)
        self._progress.setRange(0, 0)
        if self.parent():
            self.setGeometry(self.parent().rect())
        self.show()
        self.raise_()

    def set_progress(self, current: int, total: int, message: str = "") -> None:
        if message:
            self._label.setText(message)
        self._progress.setRange(0, total)
        self._progress.setValue(current)

    def hide_progress(self) -> None:
        self.hide()
