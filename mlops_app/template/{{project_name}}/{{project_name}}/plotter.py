from pathlib import Path
import matplotlib.pyplot as plt

def plot_metric(metric):
    """
    Simple demo plot function for ML metric.
    """
    plt.figure(figsize=(4, 3))
    plt.bar(["Metric"], [metric])
    plt.title("Demo MLflow Metric")
    plt.ylabel("Value")
    plt.tight_layout()
    plt.savefig("demo_metric.png")
    plt.close()
    print(f"Plot saved as demo_metric.png")

def plot_regression(y_true, y_pred, out_path="eval_plot.png"):
    """
    Scatter plot for regression evaluation.
    """
    plt.figure(figsize=(5, 4))
    plt.scatter(y_true, y_pred)
    plt.xlabel("True y")
    plt.ylabel("Predicted y")
    plt.title("Prediction vs True")
    plt.tight_layout()
    plt.savefig(out_path)
    plt.close()
    print(f"Regression plot saved as {out_path}")