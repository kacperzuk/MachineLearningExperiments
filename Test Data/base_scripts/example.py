from data import samples

print("There are {} samples.".format(len(samples)))

print("Whois data of 2nd sample (ip: {}):".format(samples[1]["ip"]))
print(samples[1]["whois"])

print("RevDNS data of first ten samples:")
print("\n".join([ repr(s["hostnames"]) for s in samples[:10] ]))

print("Open ports of first 10 samples:")
print("\n".join([ repr(s["ports"]) for s in samples[:10] ]))
