import os
import pickle
import re
import nltk
from flask import Flask, request, jsonify
from flask_cors import CORS
from sklearn.feature_extraction.text import TfidfVectorizer
import numpy as np

# Download NLTK data (run once)
nltk.download('stopwords')
nltk.download('wordnet')

app = Flask(__name__)
CORS(app)

# Load model and vectorizer
with open('model.pkl', 'rb') as f:
    model = pickle.load(f)
with open('vectorizer.pkl', 'rb') as f:
    vectorizer = pickle.load(f)

# Text cleaning function (must match training)
import nltk
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer

stop_words = set(stopwords.words('english'))
lemmatizer = WordNetLemmatizer()
IMPORTANT_WORDS = {
    'python', 'java', 'javascript', 'sql', 'aws', 'react', 'docker', 'machine learning',
    'data science', 'tensorflow', 'pytorch', 'nlp', 'cybersecurity', 'networking'
}

def clean_resume_text(text):
    if not isinstance(text, str):
        return ""
    text = text.lower()
    text = re.sub(r'http\S+|www\S+|https\S+', ' ', text)
    text = re.sub(r'\S+@\S+', ' ', text)
    text = re.sub(r'[^a-zA-Z\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text).strip()
    tokens = []
    for token in text.split():
        if token in IMPORTANT_WORDS:
            tokens.append(token)
        elif token not in stop_words and len(token) > 2:
            tokens.append(lemmatizer.lemmatize(token))
    return ' '.join(tokens)

def extract_skills(text):
    # Simple skill extraction based on known skill words
    skills = []
    skill_set = {'python', 'java', 'javascript', 'react', 'angular', 'node', 'sql', 'mongodb',
                 'aws', 'docker', 'kubernetes', 'tensorflow', 'pytorch', 'machine learning',
                 'data science', 'nlp', 'cybersecurity', 'linux', 'networking'}
    words = set(re.findall(r'\b[a-zA-Z ]+\b', text.lower()))
    for skill in skill_set:
        if skill in words:
            skills.append(skill)
    return skills

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    resume = data.get('resume', '')
    job_desc = data.get('job_description', '')
    
    # Clean and vectorize
    cleaned = clean_resume_text(resume + ' ' + job_desc)
    features = vectorizer.transform([cleaned])
    
    # Predict category (simplified: we'll use the trained model to get a score)
    # Since the model predicts category, we'll compute a dummy match score based on skill overlap
    resume_skills = set(extract_skills(resume))
    job_skills = set(extract_skills(job_desc))
    if not job_skills:
        match_score = 50
    else:
        match_score = int(len(resume_skills & job_skills) / len(job_skills) * 100)
    
    missing = list(job_skills - resume_skills)
    if match_score >= 80:
        recommendation = "Strong Match - Highly recommended"
    elif match_score >= 60:
        recommendation = "Good Match - Consider interviewing"
    else:
        recommendation = "Low Match - May not meet requirements"
    
    # Optionally also get model category prediction
    cat_pred = model.predict(features)[0]
    
    return jsonify({
        'match_score': match_score,
        'skills': list(resume_skills),
        'missing_skills': missing,
        'recommendation': recommendation,
        'predicted_category': cat_pred
    })

if __name__ == '__main__':
    app.run(port=5001, debug=True)