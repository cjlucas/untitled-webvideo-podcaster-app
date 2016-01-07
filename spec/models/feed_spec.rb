require_relative '../spec_helper'

describe VidFeeder::Feed, '#from_url' do
  context 'when given a youtube user url' do
    it 'should return a valid Feed' do
      feed = described_class.from_url('http://youtube.com/user/CannataJeff')
      expect(feed).not_to be_nil
      expect(feed.site).to eql('youtube')
      expect(feed.site_id).to eql('CannataJeff')
      feed.save
    end
  end

  context 'when given a youtube playlist url' do
    it 'should return a valid Feed' do
      feed = described_class.from_url('https://www.youtube.com/playlist?list=PLDWZ5uzn69ezRJYeWxYNRMYebvf8DerHd')
      expect(feed).not_to be_nil
      expect(feed.site).to eql('youtube')
      expect(feed.site_id).to eql('PLDWZ5uzn69ezRJYeWxYNRMYebvf8DerHd')
      feed.save
    end
  end

  context 'when given a youtube channel url' do
    it 'should return a valid Feed' do
      feed = described_class.from_url('https://www.youtube.com/channel/UCVHdvAX5-R8y5l9xp6nroBQ')
      expect(feed).not_to be_nil
      expect(feed.site).to eql('youtube')
      expect(feed.site_id).to eql('UCVHdvAX5-R8y5l9xp6nroBQ')
      feed.save
    end
  end

  context 'when given an unsupported url' do
    it 'should return nil' do
      feed = described_class.from_url('http://fakesite.com/gibberish')
      expect(feed).to be_nil
    end
  end
end

describe VidFeeder::Feed, 'add_video' do
  context 'when given a new video' do
    before(:each) do
      @f = described_class.new
      @v = VidFeeder::Video.new
      @f.add_video(@v)
    end

    it 'should be available in the videos array' do
      expect(@f.videos.size).to eq(1)
      expect(@f.videos.first).to eq(@v)
    end

    it 'should store the site name of the feed' do
      expect(@v.site).to eql(@f.site)
    end
  end
end
