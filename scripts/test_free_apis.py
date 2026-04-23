#!/usr/bin/env python3
"""Test free AI APIs for Zolai data processing."""

import requests
import json
import time

# Test prompt in Zolai
TEST_PROMPT = """Translate this Zolai sentence to English:
"A kipat cilin Pasian in vantung leh leitung a piangsak hi."
"""

def test_uncloseai():
    """Test uncloseai.com API"""
    print("\n=== Testing UncloseAI ===")
    try:
        url = "https://uncloseai.com/v1/chat/completions"
        headers = {"Content-Type": "application/json"}
        data = {
            "model": "gpt-4o-mini",  # Try their free model
            "messages": [{"role": "user", "content": TEST_PROMPT}],
            "max_tokens": 100
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=30)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✓ SUCCESS")
            print(f"Response: {result.get('choices', [{}])[0].get('message', {}).get('content', 'N/A')}")
            return True
        else:
            print(f"✗ FAILED: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"✗ ERROR: {e}")
        return False


def test_g4f():
    """Test g4f.dev API"""
    print("\n=== Testing G4F ===")
    try:
        url = "https://api.g4f.dev/v1/chat/completions"
        headers = {"Content-Type": "application/json"}
        data = {
            "model": "gpt-4o-mini",
            "messages": [{"role": "user", "content": TEST_PROMPT}]
        }
        
        response = requests.post(url, headers=headers, json=data, timeout=30)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✓ SUCCESS")
            print(f"Response: {result.get('choices', [{}])[0].get('message', {}).get('content', 'N/A')}")
            return True
        else:
            print(f"✗ FAILED: {response.text[:200]}")
            return False
    except Exception as e:
        print(f"✗ ERROR: {e}")
        return False


def test_ollama_local():
    """Test local Ollama installation"""
    print("\n=== Testing Ollama (Local) ===")
    try:
        # Check if Ollama is running
        response = requests.get("http://localhost:11434/api/tags", timeout=5)
        
        if response.status_code == 200:
            models = response.json().get('models', [])
            print(f"✓ Ollama is running")
            print(f"Available models: {[m['name'] for m in models]}")
            
            if models:
                # Test with first available model
                model_name = models[0]['name']
                print(f"\nTesting with model: {model_name}")
                
                url = "http://localhost:11434/api/generate"
                data = {
                    "model": model_name,
                    "prompt": TEST_PROMPT,
                    "stream": False
                }
                
                response = requests.post(url, json=data, timeout=60)
                if response.status_code == 200:
                    result = response.json()
                    print(f"✓ SUCCESS")
                    print(f"Response: {result.get('response', 'N/A')[:200]}")
                    return True
            else:
                print("⚠ No models installed. Run: ollama pull qwen2.5:7b")
                return False
        else:
            print(f"✗ Ollama not running. Install from ollama.com")
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"✗ Ollama not running. Start with: ollama serve")
        return False
    except Exception as e:
        print(f"✗ ERROR: {e}")
        return False


def test_ollama_free_api():
    """Test github.com/ollamafreeapi"""
    print("\n=== Testing OllamaFreeAPI ===")
    print("⚠ This requires running the service locally from GitHub")
    print("Clone: git clone https://github.com/ollamafreeapi/ollamafreeapi")
    print("Then run according to their README")
    return None


def main():
    print("Testing Free AI APIs for Zolai Project")
    print("=" * 50)
    
    results = {
        "UncloseAI": test_uncloseai(),
        "G4F": test_g4f(),
        "Ollama (local)": test_ollama_local(),
        "OllamaFreeAPI": test_ollama_free_api()
    }
    
    print("\n" + "=" * 50)
    print("SUMMARY")
    print("=" * 50)
    
    for service, status in results.items():
        if status is True:
            print(f"✓ {service}: WORKING")
        elif status is False:
            print(f"✗ {service}: FAILED")
        else:
            print(f"⚠ {service}: NEEDS SETUP")
    
    print("\n" + "=" * 50)
    print("RECOMMENDATIONS FOR ZOLAI:")
    print("=" * 50)
    
    working = [k for k, v in results.items() if v is True]
    
    if working:
        print(f"\n✓ Use these for bulk processing:")
        for service in working:
            print(f"  - {service}")
    
    print("\n💡 Best setup for Zolai:")
    print("  1. Install Ollama locally (ollama.com)")
    print("  2. Pull Qwen 2.5 Coder: ollama pull qwen2.5-coder:7b")
    print("  3. Use G4F as backup for rate limits")
    print("  4. Process 8.8GB corpus in batches")


if __name__ == "__main__":
    main()
