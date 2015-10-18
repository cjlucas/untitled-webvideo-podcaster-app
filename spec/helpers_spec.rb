require_relative 'spec_helper'


describe VidFeeder::Helpers, '#fmt_duration' do
  let(:dummy_class) { Class.new { extend VidFeeder::Helpers } }

  it 'should convert duration (in seconds) to format suitable for RSS feed' do
    expect(dummy_class.fmt_duration(1)).to eql('0:01')
    expect(dummy_class.fmt_duration(59)).to eql('0:59')
    expect(dummy_class.fmt_duration(61)).to eql('1:01')
    expect(dummy_class.fmt_duration(3599)).to eql('59:59')
    expect(dummy_class.fmt_duration(7200)).to eql('2:00:00')
  end
end

describe VidFeeder::Helpers, '#prettify_video_desc' do
  let(:dummy_class) { Class.new { extend VidFeeder::Helpers } }

  it 'should prettify the video description' do
    expect(dummy_class.prettify_video_desc("\n")).to eql("<br>")
    expect(dummy_class.prettify_video_desc("http://google.com/something?args=val")).to eql(%q{<a href="http://google.com/something?args=val">http://google.com/something?args=val</a>})
  end
end
