# build stage — install Python packages into a virtual environment
FROM python:3.12-alpine AS build
WORKDIR /app
RUN python -m venv /venv
ENV PATH="/venv/bin:$PATH"
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# final stage — copy the venv and your app only
FROM python:3.12-alpine AS final
WORKDIR /app
ENV PATH="/venv/bin:$PATH"
COPY --from=build /venv /venv
COPY app.py .
EXPOSE 5000
CMD ["python", "app.py"]
