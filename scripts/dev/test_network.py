import urllib.request
import urllib.error

# Test basic connectivity
try:
    response = urllib.request.urlopen("http://httpbin.org/ip", timeout=5)
    print("Basic connectivity: OK")
    print(response.read()[:100])
except Exception as e:
    print(f"Basic connectivity failed: {e}")

# Test ZomiDictionary.com
try:
    response = urllib.request.urlopen("https://zomidictionary.com/", timeout=10)
    print("ZomiDictionary.com: OK")
    print(f"Status: {response.getcode()}")
    print(f"Content length: {len(response.read())}")
except Exception as e:
    print(f"ZomiDictionary.com failed: {e}")

# Test search endpoint
try:
    url = "https://zomidictionary.com/results.php?query=taste"
    response = urllib.request.urlopen(url, timeout=10)
    print("ZomiDictionary search: OK")
    print(f"Status: {response.getcode()}")
    content = response.read().decode("utf-8")
    print(f"Content length: {len(content)}")
    # Check if we got the expected content
    if "taste" in content:
        print("Found 'taste' in response")
    if "to perceive flavors" in content:
        print("Found definition in response")
except Exception as e:
    print(f"ZomiDictionary search failed: {e}")
