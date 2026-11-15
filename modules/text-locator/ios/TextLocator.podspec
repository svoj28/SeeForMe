Pod::Spec.new do |s|
  s.name           = 'TextLocator'
  s.version        = '1.0.0'
  s.summary        = 'On-device text recognition with line positions (Apple Vision).'
  s.description    = 'Returns each recognized line of text and where it is in the photo, for text-framing guidance.'
  s.license        = 'MIT'
  s.author         = 'SeeForMe'
  s.homepage       = 'https://example.invalid/seeforme'
  s.platforms      = { :ios => '15.1' }
  s.swift_version  = '5.9'
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = '**/*.{h,m,mm,swift}'
end
