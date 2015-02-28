require 'rspec/core/rake_task'

task :default => [:spec]

task :spec do
  RSpec::Core::RakeTask.new do |task|
    task.verbose = false
    task.rspec_opts = '--color'
  end
end

task :test => :spec do
end

task :clean do
  system 'rm -f *.gem'
end