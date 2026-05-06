"""
ML Model Module - Resume Category Classification
Supports both trained model and fallback keyword-based classification
"""

import os
import pickle
import numpy as np
import re
from typing import Dict, List, Optional
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Download required NLTK data
try:
    import nltk
    nltk.download('stopwords', quiet=True)
    nltk.download('wordnet', quiet=True)
    nltk.download('punkt', quiet=True)
except:
    pass


class MLModel:
    """
    Machine Learning Model for Resume Category Classification
    - Supports both trained ensemble model and keyword-based fallback
    - Category: 13 job categories (HR, IT, Data Science, Sales, Finance, etc.)
    """
    
    def __init__(self, model_path: Optional[str] = None):
        """Initialize ML Model"""
        self.is_trained = False
        self.model = None
        self.vectorizer = None
        self.label_encoder = None
        self.classes = []
        self.important_words = set()
        self.category_mapping = {}
        
        # Initialize NLP tools
        self.lemmatizer = WordNetLemmatizer()
        self.stop_words = set(stopwords.words('english'))
        
        # Initialize fallback categories
        self._init_fallback_categories()
        
        # Try to load trained model
        if model_path and os.path.exists(model_path):
            self.load_model(model_path)
        else:
            # Try default paths
            default_paths = [
                os.path.join(os.path.dirname(__file__), "trained_model.pkl"),
                os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "trained_model.pkl"),
            ]
            for path in default_paths:
                if os.path.exists(path):
                    self.load_model(path)
                    break
            
            if not self.is_trained:
                print("⚠️  No trained model found. Using fallback scoring.")
    
    def _init_fallback_categories(self):
        """Initialize fallback category mapping for keyword-based classification"""
        self.fallback_categories = {
            'HR': {
                'keywords': ['hr', 'human resources', 'recruiting', 'recruitment', 'hiring', 
                           'onboarding', 'payroll', 'benefits', 'compensation', 'talent', 
                           'recruitment', 'hr manager', 'hr specialist', 'recruiter'],
                'weight': 1.0
            },
            'IT': {
                'keywords': ['software', 'developer', 'engineer', 'it', 'python', 'java', 
                           'javascript', 'web', 'backend', 'frontend', 'fullstack', 'programming',
                           'coding', 'cloud', 'devops', 'docker', 'kubernetes', 'aws', 'azure'],
                'weight': 1.0
            },
            'Data Science': {
                'keywords': ['data scientist', 'data analyst', 'machine learning', 'ml', 
                           'analytics', 'pandas', 'numpy', 'scikit-learn', 'tensorflow',
                           'data analysis', 'statistical', 'bi', 'business intelligence'],
                'weight': 1.0
            },
            'Sales & Marketing': {
                'keywords': ['sales', 'marketing', 'business development', 'account manager',
                           'digital marketing', 'seo', 'advertising', 'campaign', 'brand',
                           'sales representative', 'sales manager'],
                'weight': 1.0
            },
            'Finance & Accounting': {
                'keywords': ['finance', 'accounting', 'accountant', 'auditor', 'bookkeeper',
                           'financial analyst', 'cpa', 'tax', 'payroll', 'controller', 'cfo'],
                'weight': 1.0
            },
            'Healthcare': {
                'keywords': ['healthcare', 'medical', 'nurse', 'doctor', 'physician', 'clinical',
                           'hospital', 'patient', 'health', 'medical', 'nursing'],
                'weight': 1.0
            },
            'Education': {
                'keywords': ['teacher', 'professor', 'education', 'instructor', 'faculty',
                           'academic', 'teaching', 'trainer', 'educational'],
                'weight': 1.0
            },
            'Customer Service': {
                'keywords': ['customer service', 'support', 'call center', 'help desk',
                           'client relations', 'customer care', 'customer support'],
                'weight': 1.0
            },
            'Operations': {
                'keywords': ['operations', 'project manager', 'product manager', 'program manager',
                           'general manager', 'director', 'vp', 'executive', 'management'],
                'weight': 1.0
            },
            'Administrative': {
                'keywords': ['administrative', 'office manager', 'executive assistant',
                           'receptionist', 'secretary', 'clerk', 'admin'],
                'weight': 1.0
            },
            'Legal': {
                'keywords': ['legal', 'attorney', 'lawyer', 'paralegal', 'compliance',
                           'contract', 'law'],
                'weight': 1.0
            },
            'Engineering': {
                'keywords': ['engineer', 'civil', 'mechanical', 'electrical', 'chemical',
                           'industrial', 'manufacturing'],
                'weight': 1.0
            },
            'Design': {
                'keywords': ['designer', 'graphic', 'ui', 'ux', 'creative', 'art',
                           'video', 'photo', 'design'],
                'weight': 1.0
            }
        }
        
        # Flatten for easier lookup
        self.fallback_all_keywords = {}
        for cat, data in self.fallback_categories.items():
            for keyword in data['keywords']:
                self.fallback_all_keywords[keyword] = cat
    
    def load_model(self, model_path: str):
        """Load trained model from pickle file"""
        try:
            with open(model_path, 'rb') as f:
                model_data = pickle.load(f)
            
            self.model = model_data.get('model')
            self.vectorizer = model_data.get('vectorizer')
            self.label_encoder = model_data.get('label_encoder')
            self.classes = list(model_data.get('classes', []))
            self.important_words = set(model_data.get('important_words', []))
            self.category_mapping = model_data.get('category_mapping', {})
            
            self.is_trained = True
            print(f"✅ Trained Model Loaded: {model_path}")
            print(f"   • Model Type: {type(self.model).__name__}")
            print(f"   • Categories: {len(self.classes)} - {self.classes}")
            if hasattr(self.vectorizer, 'n_features_in_'):
                print(f"   • Features: {self.vectorizer.n_features_in_}")
            print(f"   • Important Words: {len(self.important_words)}")
            
        except Exception as e:
            print(f"⚠️  Could not load model from {model_path}: {str(e)[:100]}")
            self.is_trained = False
    
    def _clean_resume_text(self, text: str) -> str:
        """Clean and preprocess resume text"""
        if not isinstance(text, str):
            return ""
        
        text = text.lower()
        
        # Remove URLs, emails, phone numbers
        text = re.sub(r'http\S+|www\S+|https\S+', ' ', text)
        text = re.sub(r'\S+@\S+', ' ', text)
        text = re.sub(r'[\+\(]?[0-9][0-9 .\-\(\)]{8,}[0-9]', ' ', text)
        
        # Remove special characters
        text = re.sub(r'[^a-zA-Z\s]', ' ', text)
        text = re.sub(r'\s+', ' ', text).strip()
        
        # Tokenize and filter
        tokens = []
        for token in text.split():
            if token in self.important_words:
                tokens.append(token)
            elif token not in self.stop_words and len(token) > 2:
                tokens.append(self.lemmatizer.lemmatize(token))
        
        return ' '.join(tokens)
    
    def predict_category_trained(self, resume_text: str) -> Dict:
        """Predict using trained model"""
        try:
            if not self.is_trained or not self.model:
                return {"status": "failed", "error": "Model not trained"}
            
            cleaned = self._clean_resume_text(resume_text)
            if not cleaned or len(cleaned.strip()) < 5:
                return {"status": "failed", "error": "Could not extract meaningful text"}
            
            features = self.vectorizer.transform([cleaned])
            pred_class = self.model.predict(features)[0]
            probabilities = self.model.predict_proba(features)[0]
            
            top_indices = np.argsort(probabilities)[-3:][::-1]
            top_predictions = [
                {
                    "category": str(self.classes[i]),
                    "confidence": round(float(probabilities[i]), 4),
                    "percentage": f"{float(probabilities[i])*100:.2f}%"
                }
                for i in top_indices
            ]
            
            return {
                "status": "success",
                "predicted_category": str(self.classes[pred_class]),
                "confidence": round(float(probabilities[pred_class]), 4),
                "confidence_percentage": f"{float(probabilities[pred_class])*100:.2f}%",
                "top_3_predictions": top_predictions,
                "model_type": "trained_ensemble"
            }
        except Exception as e:
            print(f"Error in trained prediction: {e}")
            return {"status": "failed", "error": str(e)}
    
    def predict_category_fallback(self, resume_text: str) -> Dict:
        """Predict using keyword-based fallback"""
        try:
            text_lower = resume_text.lower()
            
            # Count keyword matches for each category
            category_scores = {}
            for category in self.fallback_categories.keys():
                category_scores[category] = 0
            
            # Score each category based on keyword matches
            for keyword, category in self.fallback_all_keywords.items():
                if keyword in text_lower:
                    category_scores[category] += 1
            
            # Get total matches
            total_matches = sum(category_scores.values())
            
            if total_matches == 0:
                # Default to IT if no keywords found
                predicted = 'IT'
                confidence = 0.1
            else:
                # Calculate probabilities
                predicted = max(category_scores.items(), key=lambda x: x[1])[0]
                confidence = category_scores[predicted] / max(total_matches, 1)
            
            # Get top 3
            sorted_cats = sorted(category_scores.items(), key=lambda x: x[1], reverse=True)
            top_predictions = [
                {
                    "category": cat,
                    "confidence": round(score / max(total_matches, 1), 4),
                    "percentage": f"{(score / max(total_matches, 1))*100:.2f}%"
                }
                for cat, score in sorted_cats[:3]
            ]
            
            return {
                "status": "success",
                "predicted_category": predicted,
                "confidence": round(min(confidence, 1.0), 4),
                "confidence_percentage": f"{min(confidence, 1.0)*100:.2f}%",
                "top_3_predictions": top_predictions,
                "model_type": "fallback_keywords"
            }
        except Exception as e:
            print(f"Error in fallback prediction: {e}")
            return {"status": "failed", "error": str(e)}
    
    def predict_category(self, resume_text: str) -> Dict:
        """Predict job category - uses trained model if available, falls back to keywords"""
        if self.is_trained:
            result = self.predict_category_trained(resume_text)
            if result.get("status") == "success":
                return result
        
        # Fallback to keyword-based prediction
        return self.predict_category_fallback(resume_text)
    
    def calculate_similarity(self, job_desc: str, resume_text: str) -> float:
        """Calculate similarity between job description and resume"""
        if self.is_trained and self.vectorizer:
            try:
                job_clean = self._clean_resume_text(job_desc)
                resume_clean = self._clean_resume_text(resume_text)
                
                tfidf_matrix = self.vectorizer.transform([job_clean, resume_clean])
                similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])
                return float(similarity[0][0]) * 100
            except:
                pass
        
        # Fallback: keyword matching
        return self._keyword_fallback(job_desc, resume_text)
    
    def _keyword_fallback(self, job_desc: str, resume_text: str) -> float:
        """Keyword-based similarity fallback"""
        job_words = set(job_desc.lower().split())
        resume_words = set(resume_text.lower().split())
        
        if not job_words:
            return 0.0
        
        common_words = job_words.intersection(resume_words)
        score = (len(common_words) / len(job_words)) * 100
        return min(score, 100.0)
