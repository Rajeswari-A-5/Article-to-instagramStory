from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.luhn import LuhnSummarizer
from sumy.summarizers.text_rank import TextRankSummarizer
from sumy.summarizers.lex_rank import LexRankSummarizer
from sumy.nlp.stemmers import Stemmer
from sumy.utils import get_stop_words
import nltk

# Ensure nltk punkt is downloaded
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')
    nltk.download('punkt_tab')

def get_summary(text: str, sentence_count: int = 10, algorithm: str = 'luhn'):
    """
    Summarizes the given text using the specified algorithm.
    Supported algorithms: 'luhn', 'textrank', 'lexrank'.
    Returns a list of summary sentences (strings).
    """
    if not text.strip():
        return []

    parser = PlaintextParser.from_string(text, Tokenizer("english"))
    stemmer = Stemmer("english")
    
    if algorithm == 'textrank':
        summarizer = TextRankSummarizer(stemmer)
    elif algorithm == 'lexrank':
        summarizer = LexRankSummarizer(stemmer)
    else:
        summarizer = LuhnSummarizer(stemmer)
        
    summarizer.stop_words = get_stop_words("english")
    
    summary = summarizer(parser.document, sentence_count)
    return [str(sentence) for sentence in summary]
