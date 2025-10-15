import pandas as pd
from io import BytesIO
import matplotlib.pyplot as plt
from aiweb_common.report_builder import ReportBuilder

def build_report(pred_path: str, fig_path: str = "eval_plot.png") -> BytesIO:
    """
    Build a report zip containing predictions and regression plot.
    Returns BytesIO zip object.
    """
    # Load predictions DataFrame
    df = pd.read_csv(pred_path)
    # Load regression plot
    fig = plt.figure()
    img = plt.imread(fig_path)
    plt.imshow(img)
    plt.axis('off')
    plt.close(fig)

    with ReportBuilder() as rb:
        rb.add_dataframe(df, "predictions.csv")
        rb.add_figure(fig, "regression_plot.png")
        zip_bytes = rb.build_zip()
    return zip_bytes