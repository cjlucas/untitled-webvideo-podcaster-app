require 'stringio'
require 'zlib'

class CompressResponse
  SUPPORTED_CONTENT_TYPES = [
    'text/',
    'application/json',
    'application/xml',
  ]

  def initialize(app)
    @app = app
  end


  def supported_content_type?
    return false if @headers.nil? || @headers['Content-Type'].nil?

    SUPPORTED_CONTENT_TYPES.each do |type|
      return true if @headers['Content-Type'].downcase.include?(type.downcase)
    end

    false
  end

  def accepts_gzip?
    @env['HTTP_ACCEPT_ENCODING'].downcase.include?('gzip')
  end

  def accepts_deflate?
    @env['HTTP_ACCEPT_ENCODING'].downcase.include?('deflate')
  end

  def accepts_compression?
    accepts_gzip? || accepts_deflate?
  end

  def compress_response
    new_resp = []
    @response.each do |resp|
      # prefer gzip over deflate
      if accepts_gzip?
        s = StringIO.new
        Zlib::GzipWriter.wrap(s) do |gz|
          gz.write(resp.to_s)
          gz.finish
        end

        new_resp << (s.rewind and s.read) and s.close
        @headers['Content-Encoding'] = 'gzip'
      elsif accepts_deflate?
        new_resp << Zlib::Deflate.deflate(resp.to_s)
        @headers['Content-Encoding'] = 'deflate'
      end
    end

    @response = new_resp
  end

  def call(env)
    @env = env
    @status, @headers, @response = @app.call(@env)

    @env.each do |key, value|
      puts [key, value].to_s if key =~ /^HTTP\_/
    end

    if @env['REQUEST_METHOD'] =~ /GET/
      compress_response if supported_content_type? && accepts_compression?

      Rack::Response.new(@response, @status, @headers).finish
    else
      [@status, @headers, @response]
    end
  end
end
