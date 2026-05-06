import PyPDF2
import docx
from typing import Dict, List
from app.utils.text_processor import extract_email, extract_phone, extract_name, clean_text

class ResumeParser:
    @staticmethod
    def extract_text_from_pdf(file_path: str) -> str:
        """Extract text from PDF file"""
        text = ""
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text += page.extract_text() or ""
        return text
    
    @staticmethod
    def extract_text_from_docx(file_path: str) -> str:
        """Extract text from DOCX file"""
        doc = docx.Document(file_path)
        return " ".join([paragraph.text for paragraph in doc.paragraphs])
    
    @staticmethod
    def parse_resume(file_path: str, file_type: str) -> Dict:
        """Parse resume and extract all information"""
        # Extract text
        if file_type == 'pdf':
            text = ResumeParser.extract_text_from_pdf(file_path)
        else:
            text = ResumeParser.extract_text_from_docx(file_path)
        
        text = clean_text(text)
        
        # Extract information
        return {
            "name": extract_name(text),
            "email": extract_email(text),
            "phone": extract_phone(text),
            "raw_text": text
        }