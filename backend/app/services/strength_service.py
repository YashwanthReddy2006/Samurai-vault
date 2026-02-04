"""Password strength analysis service."""

import re
import math
from typing import List, Tuple


# Common passwords list (abbreviated - in production, use a larger list)
COMMON_PASSWORDS = {
    "password", "123456", "12345678", "qwerty", "abc123", "monkey", "1234567",
    "letmein", "trustno1", "dragon", "baseball", "iloveyou", "master", "sunshine",
    "ashley", "bailey", "passw0rd", "shadow", "123123", "654321", "superman",
    "qazwsx", "michael", "football", "password1", "password123", "welcome",
    "jesus", "ninja", "mustang", "password1234", "admin", "root", "toor",
}

# Common patterns
KEYBOARD_PATTERNS = [
    "qwerty", "asdf", "zxcv", "1234", "0987", "qwertyuiop", "asdfghjkl",
    "zxcvbnm", "1qaz", "2wsx", "3edc", "4rfv", "5tgb", "6yhn", "7ujm", "8ik",
]


class StrengthService:
    """Password strength analysis."""
    
    def calculate_entropy(self, password: str) -> float:
        """Calculate password entropy in bits."""
        if not password:
            return 0.0
        
        charset_size = 0
        
        if re.search(r'[a-z]', password):
            charset_size += 26
        if re.search(r'[A-Z]', password):
            charset_size += 26
        if re.search(r'\d', password):
            charset_size += 10
        if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
            charset_size += 32
        if re.search(r'[\s]', password):
            charset_size += 1
        if re.search(r'[^\w\s!@#$%^&*(),.?":{}|<>]', password):
            charset_size += 50  # Other unicode chars
        
        if charset_size == 0:
            return 0.0
        
        entropy = len(password) * math.log2(charset_size)
        return round(entropy, 2)
    
    def check_common_password(self, password: str) -> bool:
        """Check if password is in common passwords list."""
        return password.lower() in COMMON_PASSWORDS
    
    def check_keyboard_pattern(self, password: str) -> bool:
        """Check for keyboard patterns."""
        lower_pass = password.lower()
        for pattern in KEYBOARD_PATTERNS:
            if pattern in lower_pass:
                return True
        return False
    
    def check_repeated_chars(self, password: str) -> bool:
        """Check for repeated characters (3+ in a row)."""
        return bool(re.search(r'(.)\1{2,}', password))
    
    def check_sequential(self, password: str) -> bool:
        """Check for sequential characters."""
        for i in range(len(password) - 2):
            if ord(password[i]) + 1 == ord(password[i+1]) == ord(password[i+2]) - 1:
                return True
            if ord(password[i]) - 1 == ord(password[i+1]) == ord(password[i+2]) + 1:
                return True
        return False
    
    def analyze(self, password: str) -> Tuple[int, str, List[str]]:
        """
        Analyze password strength.
        
        Returns: (score 0-100, label, suggestions)
        """
        if not password:
            return 0, "none", ["Password is required"]
        
        suggestions = []
        score = 0
        
        # Length scoring
        length = len(password)
        if length >= 16:
            score += 30
        elif length >= 12:
            score += 20
        elif length >= 8:
            score += 10
        else:
            suggestions.append("Use at least 12 characters")
        
        # Entropy scoring
        entropy = self.calculate_entropy(password)
        if entropy >= 60:
            score += 25
        elif entropy >= 45:
            score += 20
        elif entropy >= 30:
            score += 10
        else:
            suggestions.append("Add more variety (uppercase, numbers, symbols)")
        
        # Character variety
        has_lower = bool(re.search(r'[a-z]', password))
        has_upper = bool(re.search(r'[A-Z]', password))
        has_digit = bool(re.search(r'\d', password))
        has_special = bool(re.search(r'[!@#$%^&*(),.?":{}|<>]', password))
        
        variety_count = sum([has_lower, has_upper, has_digit, has_special])
        score += variety_count * 5
        
        if not has_upper:
            suggestions.append("Add uppercase letters")
        if not has_digit:
            suggestions.append("Add numbers")
        if not has_special:
            suggestions.append("Add special characters")
        
        # Penalties
        if self.check_common_password(password):
            score -= 30
            suggestions.append("Avoid common passwords")
        
        if self.check_keyboard_pattern(password):
            score -= 15
            suggestions.append("Avoid keyboard patterns")
        
        if self.check_repeated_chars(password):
            score -= 10
            suggestions.append("Avoid repeated characters")
        
        if self.check_sequential(password):
            score -= 10
            suggestions.append("Avoid sequential characters")
        
        # Normalize score
        score = max(0, min(100, score))
        
        # Determine label
        if score >= 80:
            label = "excellent"
        elif score >= 60:
            label = "strong"
        elif score >= 40:
            label = "good"
        elif score >= 20:
            label = "fair"
        else:
            label = "weak"
        
        return score, label, suggestions


# Global instance
strength_service = StrengthService()
