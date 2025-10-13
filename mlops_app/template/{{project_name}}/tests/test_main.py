import os
import pandas as pd
import joblib
import pytest
import matplotlib.pyplot as plt
from io import BytesIO

from {{project_name}}.main import preprocess, train_cmd, process, evaluate

@pytest.fixture
def sample_data(tmp_path):
    # Create a simple CSV file
    data = pd.DataFrame({"x": [1,2,3,4,5], "y": [2,4,6,8,10]})
    data_path = tmp_path / "simple_data.csv"
    data.to_csv(data_path, index=False)
    return str(data_path)

def test_workflow(sample_data, tmp_path):
    """End-to-end workflow: preprocess, train, process, evaluate."""
    preprocess(data_path=sample_data, test_run=True)
    clean_path = sample_data.replace(".csv", "_clean.csv")
    model_path = str(tmp_path / "model.pkl")
    train_cmd(data_path=clean_path, model_path=model_path, test_run=True)
    process(data_path=clean_path, model_path=model_path, test_run=True)
    pred_path = clean_path.replace("_clean.csv", "_pred.csv")
    evaluate(data_path=pred_path, test_run=True)
    # Check output files
    assert os.path.exists(clean_path)
    assert os.path.exists(model_path)
    assert os.path.exists(pred_path)

def test_report_builder(tmp_path):
    """Test report building using aiweb_common.ReportBuilder."""
    import pandas as pd
    import matplotlib.pyplot as plt
    from aiweb_common.report_builder import ReportBuilder

    # Create a DataFrame and a figure
    df = pd.DataFrame({"x": [1,2,3], "y": [2,4,6]})
    fig, ax = plt.subplots()
    ax.plot(df["x"], df["y"])
    plt.close(fig)

    # Build report
    with ReportBuilder() as rb:
        rb.add_dataframe(df, "results.csv")
        rb.add_figure(fig, "plot.png")
        # Optionally add a dummy file
        dummy_path = tmp_path / "dummy.txt"
        dummy_path.write_text("Hello report!")
        rb.add_file(dummy_path)
        zip_bytes = rb.build_zip()
        assert isinstance(zip_bytes, BytesIO)
        assert zip_bytes.getbuffer().nbytes > 0