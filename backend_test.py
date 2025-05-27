
import requests
import sys
import uuid
import time
from datetime import datetime

class NotezFunAPITester:
    def __init__(self, base_url="https://ee34f7e9-f0a5-40a6-aad0-cf0958783209.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.owner_token = None
        self.user_id = None
        self.username = None
        self.email = None
        self.page_id = None
        self.pagename = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_timestamp = datetime.now().strftime("%Y%m%d%H%M%S")

    def run_test(self, name, method, endpoint, expected_status, data=None, token=None, owner=False):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        if owner and self.owner_token:
            headers['Authorization'] = f'Bearer {self.owner_token}'
        elif token or self.token:
            headers['Authorization'] = f'Bearer {token or self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json() if response.text else {}
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"Response: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test API health check endpoint"""
        return self.run_test("Health Check", "GET", "", 200)

    def test_register(self, username, email, password):
        """Test user registration"""
        success, response = self.run_test(
            "User Registration",
            "POST",
            "register",
            200,
            data={"username": username, "email": email, "password": password}
        )
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['id']
            self.username = response['user']['username']
            self.email = response['user']['email']
            return True
        return False

    def test_login(self, email, password, remember_me=False):
        """Test user login"""
        success, response = self.run_test(
            "User Login",
            "POST",
            "login",
            200,
            data={"email": email, "password": password, "remember_me": remember_me}
        )
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['id']
            self.username = response['user']['username']
            self.email = response['user']['email']
            return True
        return False

    def test_get_me(self):
        """Test get current user endpoint"""
        success, response = self.run_test(
            "Get Current User",
            "GET",
            "me",
            200
        )
        return success and response.get('id') == self.user_id

    def test_create_page(self, pagename, title, short_desc, long_desc):
        """Test page creation"""
        success, response = self.run_test(
            "Create Page",
            "POST",
            "pages",
            200,
            data={
                "pagename": pagename,
                "title": title,
                "short_description": short_desc,
                "long_description": long_desc
            }
        )
        if success and 'id' in response:
            self.page_id = response['id']
            self.pagename = response['pagename']
            return True
        return False

    def test_get_user_pages(self):
        """Test getting user's pages"""
        success, response = self.run_test(
            "Get User Pages",
            "GET",
            "pages",
            200
        )
        return success and isinstance(response, list)

    def test_get_page(self):
        """Test getting a specific page"""
        if not self.page_id:
            print("❌ No page ID available for testing")
            return False
        
        success, response = self.run_test(
            "Get Page",
            "GET",
            f"pages/{self.page_id}",
            200
        )
        return success and response.get('id') == self.page_id

    def test_update_page(self, title=None, short_desc=None, long_desc=None, maintenance=None):
        """Test updating a page"""
        if not self.page_id:
            print("❌ No page ID available for testing")
            return False
        
        update_data = {}
        if title is not None:
            update_data["title"] = title
        if short_desc is not None:
            update_data["short_description"] = short_desc
        if long_desc is not None:
            update_data["long_description"] = long_desc
        if maintenance is not None:
            update_data["is_maintenance"] = maintenance
        
        success, response = self.run_test(
            "Update Page",
            "PUT",
            f"pages/{self.page_id}",
            200,
            data=update_data
        )
        return success and response.get('id') == self.page_id

    def test_get_public_page(self):
        """Test getting a public page by pagename"""
        if not self.pagename:
            print("❌ No pagename available for testing")
            return False
        
        success, response = self.run_test(
            "Get Public Page",
            "GET",
            f"public/page/{self.pagename}",
            200,
            token=None  # No token needed for public endpoint
        )
        return success and response.get('pagename') == self.pagename

    def test_submit_feedback(self, message):
        """Test submitting feedback on a page"""
        if not self.page_id:
            print("❌ No page ID available for testing")
            return False
        
        success, response = self.run_test(
            "Submit Feedback",
            "POST",
            "feedback",
            200,
            data={"page_id": self.page_id, "message": message}
        )
        return success and response.get('page_id') == self.page_id

    def test_get_page_feedback(self):
        """Test getting feedback for a page"""
        if not self.page_id:
            print("❌ No page ID available for testing")
            return False
        
        success, response = self.run_test(
            "Get Page Feedback",
            "GET",
            f"feedback/{self.page_id}",
            200,
            token=None  # Public endpoint
        )
        return success and isinstance(response, list)

    def test_get_notifications(self):
        """Test getting user notifications"""
        success, response = self.run_test(
            "Get Notifications",
            "GET",
            "notifications",
            200
        )
        return success and isinstance(response, list)

    def test_get_unread_count(self):
        """Test getting unread notification count"""
        success, response = self.run_test(
            "Get Unread Notification Count",
            "GET",
            "notifications/unread-count",
            200
        )
        return success and 'unread_count' in response

    def test_mark_notification_read(self, notification_id):
        """Test marking a notification as read"""
        success, _ = self.run_test(
            "Mark Notification Read",
            "PUT",
            f"notifications/{notification_id}/read",
            200
        )
        return success

    def test_owner_login(self, password):
        """Test owner login"""
        success, response = self.run_test(
            "Owner Login",
            "POST",
            "owner/login",
            200,
            data={"password": password}
        )
        if success and 'access_token' in response:
            self.owner_token = response['access_token']
            return True
        return False

    def test_get_all_pages(self):
        """Test getting all pages as owner"""
        success, response = self.run_test(
            "Get All Pages (Owner)",
            "GET",
            "owner/pages",
            200,
            owner=True
        )
        return success and isinstance(response, list)

    def test_suspend_page(self, reason):
        """Test suspending a page as owner"""
        if not self.page_id:
            print("❌ No page ID available for testing")
            return False
        
        success, _ = self.run_test(
            "Suspend Page",
            "POST",
            "owner/suspend",
            200,
            data={"page_id": self.page_id, "reason": reason},
            owner=True
        )
        return success

    def test_unsuspend_page(self):
        """Test unsuspending a page as owner"""
        if not self.page_id:
            print("❌ No page ID available for testing")
            return False
        
        success, _ = self.run_test(
            "Unsuspend Page",
            "POST",
            f"owner/unsuspend/{self.page_id}",
            200,
            owner=True
        )
        return success

    def test_delete_page(self):
        """Test deleting a page"""
        if not self.page_id:
            print("❌ No page ID available for testing")
            return False
        
        success, _ = self.run_test(
            "Delete Page",
            "DELETE",
            f"pages/{self.page_id}",
            200
        )
        return success

def main():
    # Setup
    tester = NotezFunAPITester()
    
    # Generate unique test data
    test_id = tester.test_timestamp
    test_username = f"testuser_{test_id}"
    test_email = f"test_{test_id}@example.com"
    test_password = "TestPass123"
    test_pagename = f"testpage_{test_id}"
    
    print("\n🚀 Starting NOTEZ FUN API Tests\n")
    print(f"Using backend URL: {tester.base_url}")
    
    # Test health check
    tester.test_health_check()
    
    # Test authentication
    print("\n--- Authentication Tests ---")
    if not tester.test_register(test_username, test_email, test_password):
        print("❌ Registration failed, stopping tests")
        return 1
    
    # Test login with remember_me=False
    if not tester.test_login(test_email, test_password):
        print("❌ Login failed, stopping tests")
        return 1
    
    # Test get current user
    tester.test_get_me()
    
    # Test page creation and management
    print("\n--- Page Management Tests ---")
    if not tester.test_create_page(
        test_pagename,
        "Test Page Title",
        "This is a short description for testing",
        "This is a much longer description that provides more details about the test page."
    ):
        print("❌ Page creation failed, stopping tests")
        return 1
    
    # Test getting user pages
    tester.test_get_user_pages()
    
    # Test getting specific page
    tester.test_get_page()
    
    # Test updating page
    tester.test_update_page(
        title="Updated Test Page Title",
        short_desc="Updated short description",
        long_desc="Updated long description with more details."
    )
    
    # Test maintenance mode
    tester.test_update_page(maintenance=True)
    
    # Test public page access
    tester.test_get_public_page()
    
    # Test feedback system
    print("\n--- Feedback System Tests ---")
    tester.test_submit_feedback("This is a test feedback message.")
    tester.test_get_page_feedback()
    
    # Test notifications
    print("\n--- Notification System Tests ---")
    tester.test_get_notifications()
    tester.test_get_unread_count()
    
    # Get notifications to find one to mark as read
    _, notifications = tester.run_test("Get Notifications for ID", "GET", "notifications", 200)
    if notifications and len(notifications) > 0:
        notification_id = notifications[0]['id']
        tester.test_mark_notification_read(notification_id)
    
    # Test owner functionality
    print("\n--- Owner Admin Tests ---")
    if not tester.test_owner_login("onlyOwner12$"):
        print("❌ Owner login failed, stopping tests")
    else:
        tester.test_get_all_pages()
        tester.test_suspend_page("Test suspension reason")
        tester.test_unsuspend_page()
    
    # Test page deletion
    print("\n--- Cleanup Tests ---")
    tester.test_delete_page()
    
    # Print results
    print(f"\n📊 Tests passed: {tester.tests_passed}/{tester.tests_run} ({tester.tests_passed/tester.tests_run*100:.1f}%)")
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())
