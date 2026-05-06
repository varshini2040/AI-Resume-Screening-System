import re
from typing import List

def extract_email(text: str) -> str:
    """Extract email from text"""
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    match = re.search(email_pattern, text)
    return match.group(0) if match else ""

def extract_phone(text: str) -> str:
    """Extract phone number from text"""
    phone_pattern = r'\b\d{10}\b|\b\d{3}[-.]?\d{3}[-.]?\d{4}\b'
    match = re.search(phone_pattern, text)
    return match.group(0) if match else ""

def extract_name(text: str) -> str:
    """Extract name (first line usually)"""
    lines = text.strip().split('\n')
    if lines:
        return lines[0].strip()[:50]
    return "Unknown"

def clean_text(text: str) -> str:
    """Clean and normalize text"""
    text = re.sub(r'\s+', ' ', text)
    text = text.strip()
    return text

def extract_skills_from_text(text: str, skill_keywords: List[str]) -> List[str]:
    """Extract skills from text based on keywords"""
    text_lower = text.lower()
    found_skills = []
    for skill in skill_keywords:
        if skill.lower() in text_lower:
            found_skills.append(skill)
    return found_skills