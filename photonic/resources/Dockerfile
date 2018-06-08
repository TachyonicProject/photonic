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
# @Vuader: The following 3 are not nessecary for Photonic, but I enjoy them:
RUN apt-get --assume-yes install ansible
RUN apt-get --assume-yes install screen
RUN apt-get --assume-yes install vim
RUN apt-get clean 

WORKDIR /root
ADD https://api.github.com/repos/TachyonicProject/luxon/git/refs/heads/development /root/luxon.json
RUN git clone -b development https://github.com/TachyonicProject/luxon.git
ADD https://api.github.com/repos/TachyonicProject/psychokinetic/git/refs/heads/development /root/psychokinetic.json
RUN git clone -b development https://github.com/TachyonicProject/psychokinetic.git
ADD https://api.github.com/repos/TachyonicProject/photonic/git/refs/heads/development /root/photonic.json
RUN git clone -b development https://github.com/TachyonicProject/photonic.git
ADD https://api.github.com/repos/TachyonicProject/infinitystone/git/refs/heads/development /root/infinitystone.json
RUN git clone -b development https://github.com/TachyonicProject/infinitystone.git
WORKDIR /root/luxon

RUN pip3 install .
WORKDIR /root/psychokinetic
RUN pip3 install .
WORKDIR /root/photonic
RUN pip3 install .
WORKDIR /root/infinitystone
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
RUN ln -s /root/photonic/photonic/static /var/www/html/static

RUN chown -R www-data:www-data infinitystone
RUN chown -R www-data:www-data photonic
RUN chown -R www-data:www-data /root/photonic
RUN chmod 701 /root

COPY 000-default.conf /etc/apache2/sites-available/

EXPOSE 80
CMD service apache2 start && tail -f /var/log/apache2/error.log
