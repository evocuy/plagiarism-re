from app.services.preprocessing_service import PreprocessingService


def test_clean_text_normalizes_case_punctuation_numbers_and_whitespace():
    service = PreprocessingService()

    result = service.clean_text("  Sistem! 2026, Pengecekan\tDOKUMEN.  ")

    assert result == "sistem pengecekan dokumen"


def test_clean_text_removes_supported_indonesian_stopwords_but_keeps_meaningful_terms():
    service = PreprocessingService()

    result = service.clean_text("Ini adalah sebuah dokumen yang sangat penting untuk mahasiswa dan dosen")

    tokens = result.split()
    assert "mahasiswa" in tokens
    assert "dosen" in tokens
    assert "ini" not in tokens
    assert "untuk" not in tokens
    assert "dan" not in tokens


def test_clean_text_applies_stemming_only_when_requested():
    service = PreprocessingService()
    text = "Mahasiswa mempelajari penelitian dan menuliskan laporan"

    without_stemming = service.clean_text(text)
    with_stemming = service.clean_text(text, use_stemming=True)

    assert "mempelajari" in without_stemming.split()
    assert "mempelajari" not in with_stemming.split()
    assert "penelitian" not in with_stemming.split()
    assert "menuliskan" not in with_stemming.split()
    assert "teliti" in with_stemming.split()
    assert "tulis" in with_stemming.split()


def test_clean_text_is_deterministic():
    service = PreprocessingService()
    text = "Dokumen penelitian mahasiswa membahas sistem informasi kampus."

    assert service.clean_text(text, use_stemming=True) == service.clean_text(text, use_stemming=True)
