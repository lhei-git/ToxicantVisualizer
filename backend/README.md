# VET Backend

## Development (API only)

0. create `.env` file in `backend/` directory with the following:
```
DB_HOST=127.0.0.1
API_KEY=<vet api key>
DJANGO_SETTINGS=prod
DJANGO_SECRET_KEY=evan
DB_USER=ubuntu
DB_PASS=ubuntu
DB_NAME=ubuntu
API_URL=api.vet.lhei.org
```

1. Downloading and installing respective package to create a local virtual environment (dependencies work best with virtualenv):
```sh
python -m pip install --user virtualenv
```

2. Creating and activating the virtual environment (in the root of the backend folder)
```sh
virtualenv <environmentname>
<environmentname>\Scripts\activate
```
NOTE: filepath system is for Windows, refer to documentation for Linux steps.
 
3. Install the following dependencies with ```pip install```
```sh
asgiref==3.2.10
Django==3.1.2
django-cors-headers==3.5.0
django-cors-middleware==1.5.0
djangorestframework==3.12.1
psycopg2-binary==2.8.6
pytz==2020.1
sqlparse==0.4.1

```

### Useful manage.py utilities

In the directory containing the file (with installed dependencies in a virtualenv), you can run:

### `python manange.py runserver` 
to start the development server with default settings

### `python manange.py inspectdb > filename.py` 
creates models (in a file) by introspecting an existing database

### `python manange.py makemigrations` 
new set of migrations will be written out based on changes to models

### `python manange.py migrate` 
applies the migrations made with the previous command

NOTE: [Different databases](https://docs.djangoproject.com/en/3.1/topics/migrations/#backend-support) have different capabilities, check link to find more.
   
### Learn More

Start from scratch by reading the [Django documentation](https://facebook.github.io/create-react-app/docs/getting-started).
