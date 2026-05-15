"""Settings dialog for app preferences."""

from __future__ import annotations

from typing import Any

from PySide6.QtWidgets import (
    QCheckBox,
    QDialog,
    QDialogButtonBox,
    QDoubleSpinBox,
    QFormLayout,
    QLineEdit,
    QPlainTextEdit,
    QPushButton,
    QScrollArea,
    QSpinBox,
    QVBoxLayout,
    QWidget,
)

from app.qt.models.config_base import ConfigBase, FieldDef


class SettingsDialog(QDialog):
    """Modal dialog for editing app settings derived from ConfigBase fields."""

    def __init__(
        self,
        app_config: ConfigBase,
        parent: QWidget | None = None,
    ) -> None:
        super().__init__(parent)
        self._app_config = app_config
        self._editors: dict[str, QWidget] = {}

        self.setWindowTitle("Settings")
        self.setMinimumSize(500, 400)

        layout = QVBoxLayout(self)

        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        content = QWidget()
        form = QFormLayout(content)

        for fld in self._app_config._fields:
            editor = self._create_field_editor(fld, self._app_config.get(fld.name))
            self._editors[fld.name] = editor
            form.addRow(fld.label + ":", editor)

        scroll.setWidget(content)
        layout.addWidget(scroll)

        reset_btn = QPushButton("Reset to Defaults")
        reset_btn.clicked.connect(self._on_reset)
        layout.addWidget(reset_btn)

        btn_box = QDialogButtonBox(
            QDialogButtonBox.StandardButton.Ok | QDialogButtonBox.StandardButton.Cancel
        )
        btn_box.accepted.connect(self._on_accept)
        btn_box.rejected.connect(self.reject)
        layout.addWidget(btn_box)

    @staticmethod
    def _create_field_editor(fld: FieldDef, value: Any) -> QWidget:
        if fld.field_type == "bool":
            editor = QCheckBox()
            editor.setChecked(bool(value))
            return editor
        if fld.field_type == "text":
            editor = QPlainTextEdit()
            editor.setMaximumHeight(80)
            editor.setPlainText(str(value))
            return editor
        if fld.field_type == "int":
            editor = QSpinBox()
            editor.setRange(int(fld.minimum), int(fld.maximum))
            editor.setValue(int(value) if value else 0)
            return editor
        if fld.field_type == "float":
            editor = QDoubleSpinBox()
            editor.setRange(fld.minimum, fld.maximum)
            editor.setDecimals(fld.decimals)
            editor.setSingleStep(fld.step)
            editor.setValue(float(value) if value else 0.0)
            return editor
        editor = QLineEdit()
        if fld.secret:
            editor.setEchoMode(QLineEdit.EchoMode.Password)
        editor.setText(str(value))
        return editor

    def _on_accept(self) -> None:
        data = {}
        for fld in self._app_config._fields:
            editor = self._editors[fld.name]
            if isinstance(editor, QCheckBox):
                data[fld.name] = editor.isChecked()
            elif isinstance(editor, QPlainTextEdit):
                data[fld.name] = editor.toPlainText()
            elif isinstance(editor, (QSpinBox, QDoubleSpinBox)):
                data[fld.name] = editor.value()
            elif isinstance(editor, QLineEdit):
                data[fld.name] = editor.text()
        self._app_config.from_dict(data)
        self.accept()

    def _on_reset(self) -> None:
        self._app_config.reset_to_defaults()
        for fld in self._app_config._fields:
            editor = self._editors[fld.name]
            if isinstance(editor, QLineEdit):
                editor.setText(str(fld.default))
            elif isinstance(editor, (QSpinBox, QDoubleSpinBox)):
                editor.setValue(fld.default if fld.default else 0)
            elif isinstance(editor, QCheckBox):
                editor.setChecked(bool(fld.default))
            elif isinstance(editor, QPlainTextEdit):
                editor.setPlainText(str(fld.default))
