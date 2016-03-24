from model.predict import predict

def process(ip, data):
    factor = predict({ "ip": ip, "data": data })[0]
    if factor == 1:
        result = {"suggestion" : "deny", "factor" : factor}
    else:
        result = {"suggestion" : "allow", "factor" : factor}

    return result
