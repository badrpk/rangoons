from transformers import pipeline
def sentiment_analysis(text):
    analyzer = pipeline('sentiment-analysis')
    return analyzer(text)
if __name__ == '__main__':
