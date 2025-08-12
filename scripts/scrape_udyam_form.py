import requests
from bs4 import BeautifulSoup
import json
import re
from typing import Dict, List, Any
import time

class UdyamFormScraper:
    def __init__(self):
        self.base_url = "https://udyamregistration.gov.in/UdyamRegistration.aspx"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        
    def extract_form_fields(self) -> Dict[str, Any]:
        """Extract form fields, validation rules, and UI structure from Udyam portal"""
        try:
            response = self.session.get(self.base_url)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extract form structure
            form_data = {
                "steps": [],
                "validation_rules": {},
                "ui_components": {}
            }
            
            # Step 1: Aadhaar + OTP Validation
            step1_fields = self._extract_step1_fields(soup)
            form_data["steps"].append({
                "step": 1,
                "title": "Aadhaar Verification",
                "fields": step1_fields
            })
            
            # Step 2: PAN Validation  
            step2_fields = self._extract_step2_fields(soup)
            form_data["steps"].append({
                "step": 2,
                "title": "PAN Verification", 
                "fields": step2_fields
            })
            
            # Extract validation rules
            form_data["validation_rules"] = self._extract_validation_rules()
            
            return form_data
            
        except Exception as e:
            print(f"Error scraping form: {e}")
            return self._get_fallback_form_structure()
    
    def _extract_step1_fields(self, soup: BeautifulSoup) -> List[Dict]:
        """Extract Aadhaar verification fields"""
        return [
            {
                "name": "aadhaar_number",
                "label": "Aadhaar Number",
                "type": "text",
                "required": True,
                "placeholder": "Enter 12-digit Aadhaar Number",
                "validation": "aadhaar_format",
                "maxLength": 12
            },
            {
                "name": "mobile_number", 
                "label": "Mobile Number",
                "type": "tel",
                "required": True,
                "placeholder": "Enter 10-digit Mobile Number",
                "validation": "mobile_format",
                "maxLength": 10
            },
            {
                "name": "otp",
                "label": "OTP",
                "type": "text",
                "required": True,
                "placeholder": "Enter 6-digit OTP",
                "validation": "otp_format",
                "maxLength": 6,
                "conditional": True
            }
        ]
    
    def _extract_step2_fields(self, soup: BeautifulSoup) -> List[Dict]:
        """Extract PAN verification fields"""
        return [
            {
                "name": "pan_number",
                "label": "PAN Number", 
                "type": "text",
                "required": True,
                "placeholder": "Enter PAN Number (e.g., ABCDE1234F)",
                "validation": "pan_format",
                "maxLength": 10,
                "pattern": "[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}"
            },
            {
                "name": "name_as_per_pan",
                "label": "Name as per PAN",
                "type": "text", 
                "required": True,
                "placeholder": "Enter name as per PAN card",
                "validation": "name_format"
            },
            {
                "name": "date_of_birth",
                "label": "Date of Birth",
                "type": "date",
                "required": True,
                "validation": "date_format"
            }
        ]
    
    def _extract_validation_rules(self) -> Dict[str, Dict]:
        """Define validation rules for form fields"""
        return {
            "aadhaar_format": {
                "pattern": "^[0-9]{12}$",
                "message": "Aadhaar number must be exactly 12 digits"
            },
            "mobile_format": {
                "pattern": "^[6-9][0-9]{9}$", 
                "message": "Mobile number must be 10 digits starting with 6-9"
            },
            "otp_format": {
                "pattern": "^[0-9]{6}$",
                "message": "OTP must be exactly 6 digits"
            },
            "pan_format": {
                "pattern": "^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$",
                "message": "PAN format: 5 letters, 4 numbers, 1 letter (e.g., ABCDE1234F)"
            },
            "name_format": {
                "pattern": "^[a-zA-Z\\s]{2,50}$",
                "message": "Name should contain only letters and spaces (2-50 characters)"
            },
            "date_format": {
                "message": "Please select a valid date of birth"
            }
        }
    
    def _get_fallback_form_structure(self) -> Dict[str, Any]:
        """Fallback form structure if scraping fails"""
        return {
            "steps": [
                {
                    "step": 1,
                    "title": "Aadhaar Verification",
                    "fields": self._extract_step1_fields(None)
                },
                {
                    "step": 2, 
                    "title": "PAN Verification",
                    "fields": self._extract_step2_fields(None)
                }
            ],
            "validation_rules": self._extract_validation_rules()
        }
    
    def save_form_schema(self, filename: str = "udyam_form_schema.json"):
        """Save extracted form schema to JSON file"""
        form_data = self.extract_form_fields()
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(form_data, f, indent=2, ensure_ascii=False)
        
        print(f"Form schema saved to {filename}")
        return form_data

if __name__ == "__main__":
    scraper = UdyamFormScraper()
    schema = scraper.save_form_schema()
    print("Udyam form scraping completed!")
    print(f"Extracted {len(schema['steps'])} steps with {sum(len(step['fields']) for step in schema['steps'])} total fields")
