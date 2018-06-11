FROM ubuntu
RUN apt-get update
RUN apt-get --assume-yes install apache2
RUN apt-get --assume-yes install apache2-dev
RUN apt-get --assume-yes install apache2-utils
RUN apt-get --assume-yes install libcurl4-openssl-dev libssl-dev
RUN apt-get --assume-yes install python3
RUN apt-get --assume-yes install python3-dev
RUN apt-get --assume-yes install python3-pip
RUN apt-get --assume-yes install git
RUN apt-get --assume-yes install sqlite3
RUN apt-get --assume-yes install libapache2-mod-wsgi-py3

# @Vuader: For some reason, even though requests is in the install-requires.txt file
# and is installed when luxon is installed, without the following luxon -i failes with
# "The 'idna<2.7,>=2.5' distribution was not found and is required by requests"
RUN pip3 install requests

# @Vuader: There is no neat cross-platform way to link host tz to container
# (https://forums.docker.com/t/synchronize-timezone-from-host-to-container/39116)
# Just this hack:
RUN apt-get --assume-yes install wget
RUN export DEBIAN_FRONTEND=noninteractive && apt-get --assume-yes install tzdata
RUN export tz=`wget -qO - http://geoip.ubuntu.com/lookup | sed -n -e 's/.*<TimeZone>\(.*\)<\/TimeZone>.*/\1/p'` &&  dpkg-reconfigure -f noninteractive tzdata

# @Vuader: The following 3 are not nessecary for Photonic, but I enjoy them:
RUN apt-get --assume-yes install ansible
RUN apt-get --assume-yes install screen
RUN apt-get --assume-yes install vim

RUN apt-get clean

RUN mkdir /opt/tachyonic
WORKDIR /opt/tachyonic
ADD https://api.github.com/repos/TachyonicProject/luxon/git/refs/heads/development luxon.json
RUN git clone -b development https://github.com/TachyonicProject/luxon.git
ADD https://api.github.com/repos/TachyonicProject/psychokinetic/git/refs/heads/development psychokinetic.json
RUN git clone -b development https://github.com/TachyonicProject/psychokinetic.git
ADD https://api.github.com/repos/TachyonicProject/photonic/git/refs/heads/development photonic.json
RUN git clone -b development https://github.com/TachyonicProject/photonic.git
ADD https://api.github.com/repos/TachyonicProject/infinitystone/git/refs/heads/development infinitystone.json
RUN git clone -b development https://github.com/TachyonicProject/infinitystone.git

WORKDIR /opt/tachyonic/luxon
RUN pip3 install .
WORKDIR /opt/tachyonic/psychokinetic
RUN pip3 install .
WORKDIR /opt/tachyonic/photonic
RUN pip3 install .
WORKDIR /opt/tachyonic/infinitystone
RUN pip3 install .

WORKDIR /var/www
RUN mkdir infinitystone
RUN luxon -i infinitystone infinitystone

RUN luxon -d infinitystone
RUN chown -R www-data:www-data infinitystone
RUN chmod 770 infinitystone/sqlite3.db
RUN luxon -r infinitystone

RUN mkdir photonic
RUN luxon -i photonic photonic
RUN ln -s ../infinitystone/public.pem  photonic/public.pem
RUN ln -s /opt/tachyonic/photonic/photonic/static /var/www/html/static

RUN chown -R www-data:www-data infinitystone
RUN chown -R www-data:www-data photonic
RUN chown -R www-data:www-data /opt/tachyonic/photonic

COPY 000-default.conf /etc/apache2/sites-available/

EXPOSE 80
CMD service apache2 start && tail -f /var/log/apache2/error.log
