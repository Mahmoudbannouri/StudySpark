
# RAG Summarizer

Projet **FastAPI** pour générer des **résumés de documents** (PDF et DOCX) en utilisant une approche **RAG (Retrieval-Augmented Generation)** avec **LangChain**, **HuggingFace**, et **Chroma**.

---

## Table des matières

- [Présentation](#présentation)
- [Fonctionnalités](#fonctionnalités)
- [Installation](#installation)
- [Structure du projet](#structure-du-projet)
- [API FastAPI](#api-fastapi)
- [Exemple d’utilisation](#exemple-dutilisation)
- [Contribuer](#contribuer)
- [Licence](#licence)

---

## Présentation

`rag_summarizer` permet de :  

- Extraire le texte de fichiers PDF et DOCX.  
- Diviser le texte en **chunks** pour recherche de similarité.  
- Générer un résumé basé sur un **modèle BART**.  
- Fournir des **métriques sur le résumé** : lisibilité, niveau de lecture, sentiment, mots-clés, nombre de chunks utilisés.  
- Offrir une **API FastAPI** pour intégration facile à un frontend.

---

## Fonctionnalités

- Extraction de texte : PDF (`PyMuPDF`) et DOCX (`python-docx`)  
- Pipeline **RAG** avec LangChain, Chroma et HuggingFace Embeddings  
- Résumés via `facebook/bart-large-cnn`  
- Analyse des métriques du résumé (`textstat`, `TextBlob`, `langdetect`)  
- Endpoint FastAPI `/summarize` pour traitement automatique de fichiers  

---

## Installation

1. **Cloner le projet** :

```bash
git clone https://github.com/Rachdi-imen/rag_summarizer.git
cd rag_summarizer
````

2. **Créer un environnement virtuel** :

```bash
python -m venv venv
venv\Scripts\activate   # Windows
# source venv/bin/activate  # macOS/Linux
```

3. **Installer les dépendances** :

```bash
pip install -r requirements.txt
```

4. **Télécharger les données NLTK/TextBlob (si nécessaire)** :

```bash
python -m textblob.download_corpora
```

---

## Structure du projet

```
rag_summarizer/
├── app/
│   ├── __init__.py
│   ├── file_loader.py      # Extraction texte PDF/DOCX
│   ├── rag_pipeline.py     # RAG + résumé
│   └── utils.py            # Métriques et analyse
├── venv/
├── main.py                 # FastAPI app
├── requirements.txt
├── .gitignore
└── README.md
```

---

## API FastAPI

### Endpoint `/summarize`

* **Méthode** : POST

* **Paramètres** :

  * `file` : fichier PDF ou DOCX à résumer
  * `level` : niveau de résumé (`short`, `medium`, `detailed`, default=`medium`)

* **Réponse JSON** :

```json
{
  "documentName": "exemple.pdf",
  "summary": "Résumé généré par le modèle...",
  "keyPoints": ["mot clé1", "mot clé2", ...],
  "metrics": {
    "wordCount": 123,
    "readabilityScore": 65.3,
    "readingLevel": "8th grade",
    "language": "en",
    "sentiment": {
      "polarity": 0.1,
      "subjectivity": 0.3
    },
    "chunksUsed": 5,
    "keywords": ["mot clé1", "mot clé2"],
    "aiModel": "facebook/bart-large-cnn"
  }
}
```

---

## Exemple d’utilisation

### Tester avec Python :

```python
from app.file_loader import extract_text_from_pdf, extract_text_from_docx
from app.rag_pipeline import generate_summary_rag
from app.utils import extract_metrics

# Exemple PDF
text = extract_text_from_pdf("example.pdf")
summary, chunks = generate_summary_rag(text, level="medium")
metrics = extract_metrics(summary, chunks)

print("Résumé :", summary)
print("Mots-clés :", metrics["keywords"])
```

### Tester avec FastAPI :

```bash
uvicorn main:app --reload
```

* Swagger UI : `http://127.0.0.1:8000/docs`
* POST un fichier PDF/DOCX et récupérer le résumé + métriques

---

## Contribuer

* Forker le dépôt
* Créer une branche `feature/<nom>`
* Commit avec des messages clairs
* Pousser la branche et créer une Pull Request

---

## Licence

Projet open-source sous licence MIT.

```


```
