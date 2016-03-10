#!/bin/bash

tmux new-window -n Scanners node DNSBL/index.js
tmux split-window -t Scanners node getipintel/index.js
tmux split-window -ht Scanners node RevDNS/index.js
tmux split-window -ht Scanners.0 node shodan/index.js
tmux split-window -t Scanners node Whois/index.js
