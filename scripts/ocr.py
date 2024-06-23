import requests
from paddleocr import PaddleOCR
from collections import defaultdict
import numpy as np
from sklearn.cluster import DBSCAN

# Initialize the OCR model
ocr = PaddleOCR(lang="korean")

# Path to the image
img_path = "ORDERLIST.jpg"

# Path to the ingredients list
ingredients_path = "cleaned_ingredients.txt"

# Load ingredients from the text file
with open(ingredients_path, "r", encoding="utf-8") as file:
    ingredients_list = [line.strip() for line in file.readlines()]

# Perform OCR on the image
result = ocr.ocr(img_path, cls=False)

# Extract bounding boxes and text
boxes = []
for i, r in enumerate(result[0]):
    x1, y1 = r[0][0]
    x2, y2 = r[0][2]
    w, h = x2 - x1, y2 - y1
    text, conf = r[1]
    boxes.append([int(x1), int(y1), int(w), int(h), text, conf, i])
non_ingredient_keywords = ["원", "합계", "가격", "배송", "쇼핑몰", "총", "개", "g"]

def is_ingredient(text):
    # Check if the text contains any non-ingredient keywords
    for keyword in non_ingredient_keywords:
        if keyword in text:
            return False
    return True

def calculate_center_y(box):
    center_y = box[1] + box[3] / 2
    return center_y

def cluster_boxes_y(boxes, eps):
    centers_y = np.array([[calculate_center_y(box)] for box in boxes])
    clustering = DBSCAN(eps=eps, min_samples=1).fit(centers_y)
    labels = clustering.labels_
    clusters = defaultdict(list)
    for i, label in enumerate(labels):
        clusters[label].append(i)
    return list(clusters.values())

def contains_ingredient(ingrd, ingrd_text):
    if ingrd in ingrd_text:
            return True

    return False
# Filter out non-ingredient texts
ingredient_texts = [text for x1, y1, w, h, text, acc, idx in boxes if is_ingredient(text)]
#ingredient_texts = [text for text in ingredient_texts if contains_ingredient(text, ingredients_list)]
result = [ingrd for ingrd in ingredients_list if contains_ingredient(ingrd, ingredient_texts)]
# Send the filtered texts to the Next.js server
url = 'http://localhost:3000/api'  # Your Next.js API endpoint
data = {'ingredients': result}

#data = {'ingredients': "토마토"}
response = requests.post(url, json=data)

