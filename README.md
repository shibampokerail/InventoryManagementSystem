# Inventory Management Dashboard Backend files
### Visit the wiki page and use the api manual for the process of technical testing.

The backend is made using python and flask along with JWT for autherization token.\
Crud contains all the create, read, update and delete functions along with a utilis.py that have some utility functions.\ 
The .env file should be located ourside the `CRUD` folder.\
Follow this next steps to make populate the env and the virtual environment.

To make this code work, you need to have a .env file in your flask-mongodb-api folder. the env is suppose to have the following arguments:
```
SECRET_KEY=
SLACKBOT_API_KEY=

USERNAME = 
PASSWORD = 
HOST = 
PORT = 
DB_NAME = 
```
After this you have to create a virtual envirnment to install all dependicies.
```python
python3 -m venv pathto/myvenv
```
then so 
```bash
source /venv/bin/activate
```
after that you need to install all dependencies with 
```
pip install -r requirements.txt
```
Once this setup is complete you can run the main.py app.
```python
python3 main.py
```
Make sure you env is currectly configured. 

### Contact @rjaswaal1634 for further reqirements or follow the manual.
