from model.predict import predict

def process(data):
    factor = predict(data)
    if factor == 1:
        result = {"suggestion" : "deny", "factor" : factor}
    else:
        result = {"suggestion" : "allow", "factor" : factor}

    return result
