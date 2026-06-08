from pathlib import Path

from {{project_name}}.sample_handler import GradioBaseHandler


def test_preview_csv_success(tmp_path):
    handler = GradioBaseHandler()
    csv_path = tmp_path / "sample.csv"
    csv_path.write_text("a,b\n1,2\n3,4\n", encoding="utf-8")

    preview_df, status = handler.preview_csv(str(csv_path))

    assert status == "CSV file loaded successfully!"
    assert list(preview_df.columns) == ["a", "b"]
    assert len(preview_df) == 2


def test_preview_csv_requires_file():
    handler = GradioBaseHandler()

    preview_df, status = handler.preview_csv("")

    assert preview_df.empty
    assert status == "Please upload a CSV file to proceed."


def test_generate_dummy_report_file_creates_text_file():
    handler = GradioBaseHandler()

    report_path = Path(handler.generate_dummy_report_file())
    try:
        assert report_path.exists()
        assert report_path.suffix == ".txt"
        assert "dummy report" in report_path.read_text(encoding="utf-8").lower()
    finally:
        report_path.unlink(missing_ok=True)
