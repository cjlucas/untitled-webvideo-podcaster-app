module VidFeeder
  class App < Sinatra::Application
    get '/register' do
      haml :create
    end

    get '/login' do
      if user.nil?
        haml :login
      else
        redirect '/'
      end
    end

    get '/logout' do
      session[:email] = nil
      redirect '/'
    end

    post '/login' do
      if User.is_valid_credentials?(params[:email], params[:password])
        session[:email] = params[:email]
        redirect '/'
      else
        halt 500, 'Invalid credentials'
      end

    end

    post '/create' do
      puts User.register!(params[:email], params[:password])
      redirect '/'
    end
  end
end
