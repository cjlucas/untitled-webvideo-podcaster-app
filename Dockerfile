FROM ruby
MAINTAINER chris@chrisjlucas.com

ADD . /app
WORKDIR /app

RUN bundle install


EXPOSE 80
CMD ["rake", "s"]
