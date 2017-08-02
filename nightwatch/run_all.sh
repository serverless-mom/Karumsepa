#!/bin/sh

cd /var/www/funnelenvy/nightwatch/

PATH="/home/ubuntu/bin:/home/ubuntu/.local/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games:/snap/bin"

xvfb-run -a --server-args="-screen 0 1024x768x24" /var/www/funnelenvy/nightwatch/node_modules/nightwatch/bin/nightwatch --config /var/www/funnelenvy/nightwatch/nightwatch.json --test tests/
#xvfb-run -a --server-args="-screen 0 1024x768x24" /var/www/funnelenvy/nightwatch/node_modules/nightwatch/bin/nightwatch --config /var/www/funnelenvy/nightwatch/nightwatch.json	--test tests/hpe/itg
#xvfb-run -a --server-args="-screen 0 1024x768x24" /var/www/funnelenvy/nightwatch/node_modules/nightwatch/bin/nightwatch --config /var/www/funnelenvy/nightwatch/nightwatch.json --test tests/hpe/marketplace

