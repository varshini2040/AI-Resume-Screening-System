"""Run this once to train and save the ML model"""
import sys
import os

# Fix path issue
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.ml_model.train_model import train_and_save_model

if __name__ == "__main__":
    print("=" * 50)
    print("🤖 TRAINING ML MODEL")
    print("=" * 50)
    train_and_save_model(save_path="app/ml_model/trained_model.pkl")
    print("\n✅ Done! Model saved to app/ml_model/trained_model.pkl")