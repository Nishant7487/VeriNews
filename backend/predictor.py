import pickle
import logging
import os

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

class FakeNewsPredictor:
    def __init__(self, model_path):
        self.model = None
        try:
            if not os.path.exists(model_path):
                logging.error(f"CRITICAL: Model file not found at {model_path}")
                return

            with open(model_path, "rb") as f:
                self.model = pickle.load(f)
            logging.info(f"Probability Model loaded successfully from {model_path}")
        except Exception as e:
            logging.error(f"Failed to load pipeline: {e}")

    def predict(self, text):
        try:
            if hasattr(self.model, 'steps'):
                vectorizer = self.model.steps[0][1]
                classifier = self.model.steps[-1][1]
            else:
                return {"prediction": "ERROR: Model is not a Pipeline. Cannot find Vectorizer.", "confidence": 0.0, "top_words": []}

            text_vector = vectorizer.transform([text])
            
            prediction_value = classifier.predict(text_vector)[0]
            confidence_array = classifier.predict_proba(text_vector)[0]
            confidence = float(max(confidence_array) * 100)
            
            feature_names = vectorizer.get_feature_names_out()
            coefficients = classifier.coef_[0]
            
            non_zero_indices = text_vector.nonzero()[1]
            
            word_weights = [(feature_names[idx], float(coefficients[idx])) for idx in non_zero_indices]
            
            if prediction_value == 1: 
                final_prediction = "Fake News"
                sorted_words = sorted(word_weights, key=lambda x: x[1], reverse=True)
            else:
                final_prediction = "Real News"
                sorted_words = sorted(word_weights, key=lambda x: x[1], reverse=False)
                
            top_5_words = [word[0] for word in sorted_words[:5]]
            
            return {
                "prediction": final_prediction,
                "confidence": round(confidence, 2),
                "top_words": top_5_words
            }
        except Exception as e:
            return {
                "prediction": f"ERROR: {str(e)}",
                "confidence": 0.0,
                "top_words": []
            }
