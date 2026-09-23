import pytest
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

from app.services.preprocessing_service import PreprocessingService


def calculate_similarity(text_a: str, text_b: str) -> float:
    preprocessor = PreprocessingService()
    cleaned_documents = [
        preprocessor.clean_text(text_a),
        preprocessor.clean_text(text_b),
    ]
    tfidf_matrix = TfidfVectorizer().fit_transform(cleaned_documents)
    return float(cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0])


def test_identical_documents_have_perfect_similarity():
    text = "Sistem informasi kampus membantu mahasiswa mengunggah dokumen skripsi."

    score = calculate_similarity(text, text)

    assert score == pytest.approx(1.0)


def test_related_documents_score_higher_than_unrelated_documents():
    submitted_text = "Sistem pengecekan kemiripan dokumen skripsi menggunakan metode TF IDF."
    related_text = "Metode TF IDF digunakan untuk menghitung kemiripan naskah skripsi mahasiswa."
    unrelated_text = "Budidaya tanaman padi membutuhkan pengaturan irigasi dan pemupukan yang tepat."

    related_score = calculate_similarity(submitted_text, related_text)
    unrelated_score = calculate_similarity(submitted_text, unrelated_text)

    assert related_score > unrelated_score
    assert related_score > 0.0
    assert unrelated_score == pytest.approx(0.0)


def test_similarity_score_is_bounded_between_zero_and_one():
    score = calculate_similarity(
        "Dokumen penelitian membahas keamanan sistem informasi kampus.",
        "Keamanan informasi kampus menjadi fokus utama penelitian sistem.",
    )

    assert 0.0 <= score <= 1.0
