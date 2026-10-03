"""
Evaluation Dataset for Repeated Complaint Root-Cause Finder.

Contains 30 complaints designed to rigorously benchmark:
  1. High lexical overlap (nearly identical wording)
  2. Paraphrased/differently worded complaints (synonym variation)
  3. Short/terse complaints ("wifi dead", "ac leaking")
  4. Multi-category complaints describing the same physical issue
  5. Ambiguous/cross-cutting complaints
  6. Noisy complaints (typos, punctuation, extra filler words)
  7. Clearly unrelated singleton complaints

Ground Truth Groups:
  - Cluster 1: WiFi / Campus Connectivity (4 complaints)
  - Cluster 2: Main Canteen Food Quality & Temperature (4 complaints)
  - Cluster 3: Classroom / Presentation Equipment Failures (4 complaints)
  - Cluster 4: Air Conditioning / HVAC Issues in Science Block (3 complaints)
  - Cluster 5: Restroom / Plumbing Water Pressure (3 complaints)
  - Singletons (Unrelated): 12 distinct complaints
"""

EVALUATION_COMPLAINTS = [
    # --- Group 1: WiFi / Connectivity (4 complaints) ---
    {
        "id": 1,
        "title": "WiFi keeps disconnecting in Block A",
        "description": "The campus WiFi drops every few minutes when I am in Block A. Reconnecting takes forever.",
        "category": "IT",
        "submitter": "Rahul Sharma",
        "expected_group": "group_wifi"
    },
    {
        "id": 2,
        "title": "Campus wireless network is completely broken",
        "description": "Internet disconnects repeatedly across the university. Cannot access coursework online.",
        "category": "IT",
        "submitter": "Priya Patel",
        "expected_group": "group_wifi"
    },
    {
        "id": 3,
        "title": "WiFi dead in Block A",  # Short complaint
        "description": "No signal in Block A rooms.",
        "category": "IT",
        "submitter": "Kunal",
        "expected_group": "group_wifi"
    },
    {
        "id": 4,
        "title": "Unstable internet and network packet loss",  # Differently worded
        "description": "Constant wifi dropouts and timeouts when browsing the campus web portal in academic block.",
        "category": "IT",
        "submitter": None,
        "expected_group": "group_wifi"
    },

    # --- Group 2: Canteen Food (4 complaints) ---
    {
        "id": 5,
        "title": "Canteen food is served cold",
        "description": "The food served at the main cafeteria is lukewarm or completely cold during lunch hours.",
        "category": "Canteen",
        "submitter": "Sneha Reddy",
        "expected_group": "group_canteen"
    },
    {
        "id": 6,
        "title": "Lunch meals are cold and unhygienic",
        "description": "Food temperature at the cafeteria is unacceptable. Students are getting cold rice and curries.",
        "category": "Canteen",
        "submitter": "Vikram Singh",
        "expected_group": "group_canteen"
    },
    {
        "id": 7,
        "title": "Cold cafeteria food every afternoon",
        "description": "Lunch served at the campus dining hall has been cold for three consecutive days.",
        "category": "Canteen",
        "submitter": "Ananya",
        "expected_group": "group_canteen"
    },
    {
        "id": 8,
        "title": "Terrible meal temperature at canteen",
        "description": "Lunch trays are cold by the time we sit down to eat. Kitchen staff needs to keep hot dishes warm.",
        "category": "Canteen",
        "submitter": None,
        "expected_group": "group_canteen"
    },

    # --- Group 3: Classroom Projectors (4 complaints) ---
    {
        "id": 9,
        "title": "Projector not working in Room 204",
        "description": "The projector in classroom 204 has stopped working. Turns on but no display output during lectures.",
        "category": "Facilities",
        "submitter": "Dr. Meena Iyer",
        "expected_group": "group_projector"
    },
    {
        "id": 10,
        "title": "Classroom projector keeps shutting down",
        "description": "The projector display in the lecture hall powers off randomly during professor presentations.",
        "category": "Facilities",
        "submitter": "Prof. Arjun Nair",
        "expected_group": "group_projector"
    },
    {
        "id": 11,
        "title": "Display projector fails during lectures",
        "description": "Projector equipment in teaching rooms is unreliable. Display goes blank during class presentations.",
        "category": "Facilities",
        "submitter": "Kavitha",
        "expected_group": "group_projector"
    },
    {
        "id": 12,
        "title": "Room 204 presentation screen black",
        "description": "Overhead projector lamp does not shine and HDMI signal fails in room 204.",
        "category": "IT",  # Different category, same physical root cause
        "submitter": "Teaching Assistant",
        "expected_group": "group_projector"
    },

    # --- Group 4: Science Block AC Failure (3 complaints) ---
    {
        "id": 13,
        "title": "Air conditioning not cooling Science Block Lab 3",
        "description": "The AC unit in Lab 3 is blowing warm air. The lab gets extremely hot in the afternoon.",
        "category": "Facilities",
        "submitter": "Rohan",
        "expected_group": "group_ac"
    },
    {
        "id": 14,
        "title": "AC leaking water in Science Block",
        "description": "Cooling unit on the second floor of Science Block is leaking water onto desks and not cooling.",
        "category": "Facilities",
        "submitter": "Lab Tech",
        "expected_group": "group_ac"
    },
    {
        "id": 15,
        "title": "Science building air conditioner broken",
        "description": "HVAC cooling has completely stopped in the science department. Classrooms are sweltering.",
        "category": "Facilities",
        "submitter": "Dr. Sen",
        "expected_group": "group_ac"
    },

    # --- Group 5: Water Pressure (3 complaints) ---
    {
        "id": 16,
        "title": "Hostel water pressure is extremely low",
        "description": "Water pressure in Hostel Block B bathrooms is down to a trickle. Showers do not work.",
        "category": "Hostel",
        "submitter": "Farhan",
        "expected_group": "group_water"
    },
    {
        "id": 17,
        "title": "Low bathroom water pressure in student hostel",
        "description": "Taps on the 3rd floor of the residence hostel have virtually no water flow every morning.",
        "category": "Hostel",
        "submitter": "Hostel Rep",
        "expected_group": "group_water"
    },
    {
        "id": 18,
        "title": "No shower water pressure in dorms",
        "description": "Water supply pressure is too weak for bathroom fixtures in the student residence halls.",
        "category": "Hostel",
        "submitter": None,
        "expected_group": "group_water"
    },

    # --- Singletons / Unrelated complaints (12 complaints) ---
    {
        "id": 19,
        "title": "Parking lot is overcrowded",
        "description": "Not enough car or bike parking spaces near the west campus gate.",
        "category": "Transport",
        "submitter": "Rajesh Gupta",
        "expected_group": None
    },
    {
        "id": 20,
        "title": "Library study chairs damaged",
        "description": "Several wooden chairs in the reading section have loose legs and squeak loudly.",
        "category": "Library",
        "submitter": "Ananya Das",
        "expected_group": None
    },
    {
        "id": 21,
        "title": "Student ID card replacement delayed",
        "description": "Administrative office has taken three weeks to print replacement student badges.",
        "category": "Admin",
        "submitter": "Deepa",
        "expected_group": None
    },
    {
        "id": 22,
        "title": "Broken wooden bench outside gym",
        "description": "Bench seat is cracked and has exposed rusty nails near the basketball court.",
        "category": "Sports",
        "submitter": None,
        "expected_group": None
    },
    {
        "id": 23,
        "title": "Gym treadmill 2 belt slipping",
        "description": "The running belt on treadmill #2 stops abruptly when running at speeds above 8 km/h.",
        "category": "Sports",
        "submitter": "Coach Roy",
        "expected_group": None
    },
    {
        "id": 24,
        "title": "Bus schedule mismatch on route 4",
        "description": "The evening shuttle departs ten minutes earlier than the posted timetable on Tuesdays.",
        "category": "Transport",
        "submitter": "Commuter Club",
        "expected_group": None
    },
    {
        "id": 25,
        "title": "Book return kiosk scanner failure",
        "description": "Barcode reader on the automated library dropbox cannot scan barcode labels.",
        "category": "Library",
        "submitter": "Librarian",
        "expected_group": None
    },
    {
        "id": 26,
        "title": "Stray dogs near the botanical garden",
        "description": "Pack of stray dogs barking aggressively at joggers near the south trail.",
        "category": "Security",
        "submitter": "Guard Team",
        "expected_group": None
    },
    {
        "id": 27,
        "title": "Broken glass window on 4th floor stairwell",
        "description": "Stairwell windowpane was shattered during yesterday storm. Rain is getting in.",
        "category": "Facilities",
        "submitter": "Janitor",
        "expected_group": None
    },
    {
        "id": 28,
        "title": "Fee payment receipt gateway error",
        "description": "Card was charged 5000 rupees but student portal status still shows unpaid.",
        "category": "Finance",
        "submitter": "Aakash",
        "expected_group": None
    },
    {
        "id": 29,
        "title": "Elevator door stuck in Admin Block",
        "description": "Elevator B gets stuck on floor 3 and doors fail to open automatically.",
        "category": "Facilities",
        "submitter": "Reception",
        "expected_group": None
    },
    {
        "id": 30,
        "title": "Noisy lawnmower during morning exams",
        "description": "Grounds maintenance started mowing grass right outside Exam Hall 1 during finals.",
        "category": "General",
        "submitter": "Invigilator",
        "expected_group": None
    },
]
