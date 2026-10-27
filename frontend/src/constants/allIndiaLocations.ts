/**
 * Shared All-India Locations Directory for Market Booking, Godown Storage, and Mandi Prices.
 * Ensures all 22 states and their major districts are ALWAYS available in cascading dropdowns.
 */

export const ALL_INDIA_LOCATIONS: Record<string, string[]> = {
  "Andhra Pradesh": [
    "Kurnool", "Nandyal", "Guntur", "Krishna", "Anantapur", 
    "Chittoor", "Visakhapatnam", "East Godavari", "West Godavari", 
    "Kadapa", "Nellore", "Prakasam", "Srikakulam", "Vizianagaram"
  ],
  "Telangana": [
    "Hyderabad", "Warangal", "Khammam", "Nizamabad", "Karimnagar", 
    "Nalgonda", "Mahbubnagar", "Medak", "Adilabad", "Ranga Reddy"
  ],
  "Karnataka": [
    "Raichur", "Dharwad", "Mandya", "Belagavi", "Ballari", 
    "Mysuru", "Bengaluru Rural", "Davanagere", "Shimoga", "Kalaburagi"
  ],
  "Maharashtra": [
    "Nashik", "Thane", "Latur", "Pune", "Nagpur", 
    "Jalgaon", "Ahmednagar", "Kolhapur", "Solapur", "Amravati"
  ],
  "Gujarat": [
    "Mehsana", "Rajkot", "Ahmedabad", "Surat", "Vadodara", 
    "Junagadh", "Banaskantha", "Bhavnagar", "Amreli", "Patan"
  ],
  "Madhya Pradesh": [
    "Neemuch", "Indore", "Ujjain", "Bhopal", "Gwalior", 
    "Dewas", "Mandsaur", "Jabalpur", "Sagar", "Dhar"
  ],
  "Punjab": [
    "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", 
    "Firozpur", "Sangrur", "Hoshiarpur", "Moga"
  ],
  "Haryana": [
    "Karnal", "Kurukshetra", "Ambala", "Hisar", "Rohtak", 
    "Sirsa", "Panipat", "Sonipat", "Fatehabad"
  ],
  "Rajasthan": [
    "Kota", "Jaipur", "Jodhpur", "Bikaner", "Sri Ganganagar", 
    "Alwar", "Nagaur", "Baran", "Hanumangarh"
  ],
  "Tamil Nadu": [
    "Erode", "Coimbatore", "Madurai", "Salem", "Thanjavur", 
    "Tiruchirappalli", "Tirunelveli", "Dindigul"
  ],
  "Uttar Pradesh": [
    "Muzaffarnagar", "Meerut", "Agra", "Aligarh", "Bareilly", 
    "Varanasi", "Kanpur Nagar", "Prayagraj", "Gorakhpur", "Mathura"
  ],
  "Bihar": [
    "Patna", "Muzaffarpur", "Bhagalpur", "Gaya", "Purnia", 
    "Begusarai", "Samastipur", "Nalanda"
  ],
  "West Bengal": [
    "Burdwan", "Hooghly", "Nadia", "Murshidabad", "North 24 Parganas", 
    "Malda", "Jalpaiguri"
  ],
  "Odisha": [
    "Bargarh", "Cuttack", "Sambalpur", "Balasore", "Ganjam", 
    "Kalahandi", "Bolangir"
  ],
  "Kerala": [
    "Wayanad", "Palakkad", "Kozhikode", "Thrissur", "Ernakulam", 
    "Idukki", "Kottayam"
  ],
  "Assam": [
    "Kamrup", "Nagaon", "Sonitpur", "Cachar", "Dibrugarh", "Barpeta"
  ],
  "Chhattisgarh": [
    "Raipur", "Durg", "Bilaspur", "Rajnandgaon", "Dhamtari"
  ],
  "Jharkhand": [
    "Ranchi", "Dhanbad", "Bokaro", "Jamshedpur", "Hazaribagh"
  ],
  "Uttarakhand": [
    "Dehradun", "Haridwar", "Udham Singh Nagar", "Nainital"
  ],
  "Himachal Pradesh": [
    "Shimla", "Kullu", "Mandi", "Kangra", "Solan"
  ],
  "Jammu & Kashmir": [
    "Srinagar", "Jammu", "Anantnag", "Baramulla", "Pulwama"
  ],
  "Delhi": [
    "North Delhi", "South Delhi", "West Delhi", "East Delhi", "Central Delhi"
  ]
};

export const ALL_INDIA_STATES = Object.keys(ALL_INDIA_LOCATIONS).sort();
