require_relative '../spec_helper'

describe VidFeeder::Feed, '#from_url' do
  context 'when given a youtube user url' do
    it 'should return a valid Feed' do
      feed = described_class.from_url('http://youtube.com/user/CannataJeff')
      expect(feed.site).to eql('youtube')
      expect(feed.feed_id).to eql('CannataJeff')
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