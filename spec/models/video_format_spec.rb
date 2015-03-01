require_relative '../spec_helper'

describe VidFeeder::VideoFormat, '#==' do
  describe 'when given two VideoFormat objects with the same resolution' do
    it 'should express equality' do
      f1 = described_class.new(resolution: 1080, url: 'http://url1.com')
      f2 = described_class.new(resolution: 1080, url: 'http://url2.com')
      expect(f1).to eq(f2)
    end
  end

  describe 'when given two formats with different resolutions' do
    it 'should express inequality' do
      f1 = described_class.new(resolution: 720, url: 'http://url1.com')
      f2 = described_class.new(resolution: 1080, url: 'http://url1.com')
      expect(f1).not_to eq(f2)
    end
  end
end