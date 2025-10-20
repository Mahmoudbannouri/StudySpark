from transformers import pipeline
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter



summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
embedding_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

def generate_summary_rag(text: str, level: str = "medium") -> tuple:
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    docs = splitter.create_documents([text])
    vectorstore = Chroma.from_documents(docs, embedding=embedding_model)
    retrieved_docs = vectorstore.similarity_search(text, k=3)
    combined = " ".join([doc.page_content for doc in retrieved_docs])

    length_map = {"short": 100, "medium": 200, "detailed": 300}
    summary = summarizer(combined, max_length=length_map.get(level, 200), min_length=50, do_sample=False)[0]["summary_text"]
    return summary, retrieved_docs
