# Author: Evan de Jesus

FROM python:3
ENV PYTHONUNBUFFERED=1
RUN apt update -y && apt install -y postgresql-client
RUN mkdir /code
WORKDIR /code
COPY requirements.txt /code/
RUN pip install -r requirements.txt
COPY . /code/