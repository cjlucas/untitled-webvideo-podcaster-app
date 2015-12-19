FROM ruby:latest
MAINTAINER chris@chrisjlucas.com

ADD docker/worker/crontab /etc/cron.d/youtubedl-worker
RUN chmod 644 /etc/cron.d/youtubedl-worker

RUN apt-get -y install wget python
RUN wget -q https://yt-dl.org/downloads/2015.10.24/youtube-dl -O /usr/bin/youtube-dl
RUN chmod +x /usr/bin/youtube-dl
RUN youtube-dl --update

ADD . /app
WORKDIR /app

RUN bundle install
CMD ["rake", "work"]
