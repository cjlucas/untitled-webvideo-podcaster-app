require_relative '../spec_helper'

describe VidFeeder::Video, '#update_formats' do
  VideoFormat = VidFeeder::VideoFormat

  before(:each) do
    @video = described_class.new
    @video.formats << VideoFormat.new(resolution: 1080, url: 'http://url1.com')
    @video.save
  end

  context 'when given a new format' do
    nf = VideoFormat.new(resolution: 720, url: 'http://url2.com')
    it 'should add that new format to the list of formats' do
      expect(@video.formats.size).to eq(1)

      @video.update_formats([nf])
      @video.save
      expect(@video.formats.size).to eq(2)
    end
  end

  context 'when given a existing format with updated data' do
    nurl = 'http://url2.com'
    nf = VideoFormat.new(resolution: 1080, url: nurl)
    it 'should update the format with the new data' do
      expect(@video.formats.size).to eq(1)
      @video.update_formats([nf])
      expect(@video.formats.size).to eq(1)
      expect(@video.formats.first.url).to eql(nurl)
    end
  end
end

describe VidFeeder::Video, '#update_metadata' do
  before(:each) do
    @video = described_class.new
    @video.title = 'Title'
    @video.description = 'Description of the video'
    @video.site_id = 'fjdisoa'
    @video.upload_date = Date.new(2014, 11, 7)
  end

  context 'when updating video metadata' do
    it 'should reflect those changes' do
      new_video = described_class.new
      new_video.description = 'New Description'

      @video.update_metadata(new_video)
      expect(@video.description).to eql('New Description')
      expect(@video.id).not_to eq(new_video.id)
    end
  end
end
