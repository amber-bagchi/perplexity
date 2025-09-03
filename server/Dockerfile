FROM python:3.12-slim

WORKDIR /app

#Install Dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

#Copy the project files to the container
COPY . .

#Expose the port
EXPOSE 8000

# Command to run the application
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]