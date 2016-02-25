def process(data):

    factor = 1
    text = ""
    dangers = ["vps", "vpn", "hosting", "server", "bot", "proxy", "amazon"]
    evil_ports = [22, 80, 443, 587, 465, 8080]
    for whois_data in data["whois"]["whois"]:
        for value in whois_data["data"].values():
            text += value

    for danger in dangers:
        if(danger in text):
            factor *= 0.1

    text = ""
    
    for revdns_data in data["revdns"]["hostnames"]:
            text += revdns_data

    for danger in dangers:
        if(danger in text):
            factor *= 0.1

    for blacklist in data ["dnsbl"]["blacklists"]:
        if(data ["dnsbl"]["blacklists"][blacklist]):
            factor *= 0.8

    if ("ports" in data["shodan"]["shodan"]):
        for port in data["shodan"]["shodan"]["ports"]:
            if (port in evil_ports):
                factor *= 0.7

    if (factor < 0.05):
        result = {"suggestion" : "deny", "factor" : factor}
    else:
        result = {"suggestion" : "allow", "factor" : factor}
    
    return result
