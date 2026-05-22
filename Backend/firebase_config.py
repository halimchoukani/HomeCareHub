import firebase_admin
from firebase_admin import credentials, db

cred = credentials.Certificate(
    "firebase/secret.json"
)

firebase_admin.initialize_app(cred, {
    'databaseURL': 'https://homecarehub-9d2dc-default-rtdb.europe-west1.firebasedatabase.app/'
})