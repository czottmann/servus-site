require "bundler/setup"
Bundler.require


namespace :dev do

  desc "Generate the site in ./build/ from the files in ./src/."
  task :generate do
    stasis = Stasis.new("src/", "../build/")
    stasis.render
  end


  desc "Auto-generation mode, open localhost:3000."
  task :auto_generate do
    # Stasis::DevMode doesn't work as expected, dunno why.  Too lazy to dig
    # deeper right now.
    system("cd src; stasis -d 3000 -p ../build/; cd ..")
  end

end


namespace :git do

  desc "Commit regenerated build folder."
  task :commit_build do
    system("git commit -m '[NEW] Re-generated build folder.' build/")
  end

end


desc "Deploy to Heroku (by pushing to all remotes)."
task :deploy do
  system("git push all master")
end
