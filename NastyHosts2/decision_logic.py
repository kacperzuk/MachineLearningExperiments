import nasty_threats

def process(data):

    factor = 1
    text = ""

    if data["whois"]["whois"]:
      for whois_data in data["whois"]["whois"]:
          for value in whois_data["data"].values():
              text += value

    for danger in nasty_threats.dangers:
        if(danger in text.lower()):
            factor *= nasty_threats.dangers[danger]

    text = ""

    for revdns_data in data["revdns"]["hostnames"]:
            text += revdns_data

    for danger in nasty_threats.dangers:
        if(danger in text.lower()):
            factor *= nasty_threats.dangers[danger]

    for blacklist in data ["dnsbl"]["blacklists"]:
        if(data ["dnsbl"]["blacklists"][blacklist]):
            factor *= 0.8
    if (data["shodan"]["shodan"]):
        if ("ports" in data["shodan"]["shodan"]):
            for port in data["shodan"]["shodan"]["ports"]:
                if (port in nasty_threats.evil_ports):
                    factor *= nasty_threats.evil_ports[port]
                else:
                    factor *= 0.7

    factor = float("{:.4f}".format(factor))

    if (factor < 0.05):
        result = {"suggestion" : "deny", "factor" : factor}
    else:
        result = {"suggestion" : "allow", "factor" : factor}

    return result
